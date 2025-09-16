import {
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { InvoiceService } from '../../Services/invoice.service';

@Component({
  selector: 'app-invoice-scanner',
  standalone: false,
  templateUrl: './invoice-scanner.component.html'
})
export class InvoiceScannerComponent implements OnInit, OnDestroy {
  @Output() onVerified = new EventEmitter<any>();
  @Output() onInvalid = new EventEmitter<void>();

  @ViewChild('scanner', { static: true }) scannerElem!: ElementRef<HTMLDivElement>;

  private html5Qrcode: any = null;
  private Html5QrcodeClass: any = null;
  private destroy$ = new Subject<void>();

  scanning = false;
  verifying = false;
  message = '';
  lastDecodedText = '';
  foundInvoice: any = null;

  constructor(
    private invoiceService: InvoiceService,
    private zone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {}

  /** Public scanner starter (preserves original logic) */
  async startScanner(): Promise<void> {
    if (this.scanning) return;

    // Modern browsers require secure context (https) for getUserMedia except for localhost.
    const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
    if (!window.isSecureContext && !isLocalhost) {
      this.message = 'Camera access requires a secure connection (HTTPS). Serve the app over HTTPS or use localhost.';
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      this.message = 'Camera API not supported in this browser.';
      return;
    }

    this.message = '';
    try {
      // Prompt for permission first (quick probe)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // stop the probe tracks immediately
      stream.getTracks().forEach(t => t.stop());

      // dynamic import of html5-qrcode if not loaded
      if (!this.Html5QrcodeClass) {
        const module = await import('html5-qrcode');
        this.Html5QrcodeClass = module?.Html5Qrcode ?? module?.default ?? module;
      }

      // Prepare camera list: prefer Html5Qrcode.getCameras(), but fall back to enumerateDevices
      let cameras: Array<{ id: string; label?: string }> = [];
      try {
        if (typeof this.Html5QrcodeClass?.getCameras === 'function') {
          // Html5Qrcode.getCameras() returns camera info if available
          cameras = await this.Html5QrcodeClass.getCameras();
        }
      } catch {
        // ignore and try enumerateDevices below
      }

      if (!cameras || cameras.length === 0) {
        try {
          // enumerateDevices gives deviceIds for video inputs
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          cameras = videoDevices.map(d => ({ id: d.deviceId, label: (d as any).label }));
        } catch {
          // if this fails, we'll fallback to facingMode constraints
        }
      }

      // Choose camera id preferring back/environment labels
      let cameraId: string | undefined;
      if (cameras && cameras.length) {
        cameraId = cameras.find(c => /back|rear|environment/i.test(c.label || ''))?.id || cameras[0].id;
      }

      // Create Html5Qrcode instance using the actual element (avoid id binding issues)
      const elementOrId = this.scannerElem?.nativeElement ?? undefined;
      // If html5-qrcode expects id string some versions accept HTMLElement as well; we pass element first.
      this.html5Qrcode = new this.Html5QrcodeClass(elementOrId);

      const config = {
        fps: 10,
        qrbox: { width: 280, height: 280 } as any,
        // nice to allow verbose rendering options if library supports them (kept minimal)
      };

      // Camera selection strategy:
      // 1) try cameraId (deviceId) if available
      // 2) else try facingMode: environment
      // 3) else fallback to permissive true (let browser choose)
      const cameraArgs = cameraId ?? ({ facingMode: 'environment' } as any);

      await this.html5Qrcode.start(
        cameraArgs,
        config,
        (decodedText: string) => {
          // run in Angular zone to update UI
          this.zone.run(() => {
            // avoid double-processing the same text rapidly
            if (this.verifying || decodedText === this.lastDecodedText) return;
            this.lastDecodedText = decodedText;
            this.verifying = true;
            this.message = 'Code detected — verifying...';
            // stop scanning while verifying
            this.stopScanner();
            this.verifyCode(decodedText);
          });
        },
        (errorMessage: string) => {
          // per-frame decode errors are normal; keep silent to avoid spam
          // (optionally you can log in dev only)
        }
      );

      this.scanning = true;
      this.message = '';
    } catch (err: any) {
      // provide friendly error messages for common problems
      console.error('startScanner error', err);
      const msg = (err?.name ?? '').toString().toLowerCase();
      if (msg.includes('notallowed') || msg.includes('permissiondenied')) {
        this.message = 'Camera permission was denied. Allow camera access in browser settings and try again.';
      } else if (msg.includes('notfound') || msg.includes('nocameras')) {
        this.message = 'No camera was found on this device.';
      } else if (msg.includes('notsecure') || msg.includes('insecurecontext')) {
        this.message = 'Camera access blocked because the app is not served over HTTPS. Use HTTPS or localhost.';
      } else {
        this.message = 'Failed to start camera: ' + (err?.message ?? String(err));
      }
      this.scanning = false;
    }
  }

  async stopScanner(): Promise<void> {
    if (!this.html5Qrcode) {
      this.scanning = false;
      return;
    }
    try {
      // stop() may throw if already stopped — guard with try/catch
      await this.html5Qrcode.stop();
      // clear UI elements rendered by html5-qrcode
      await this.html5Qrcode.clear();
    } catch (err) {
      // ignore non-fatal stop errors
      console.warn('stopScanner error', err);
    } finally {
      this.scanning = false;
    }
  }

  private extractInvoiceCode(raw: string): string | null {
    if (!raw) return null;
    raw = raw.trim();
    try {
      // If it's a URL, try parsing query param 'code' or last path segment
      const u = new URL(raw);
      const q = u.searchParams.get('code');
      if (q) return q.trim();

      const parts = u.pathname.split('/').filter(Boolean);
      // if last segment looks like a code (INV...), return it; otherwise return last segment
      if (parts.length) return parts[parts.length - 1].trim();
      // fallback to entire search if any
      return raw;
    } catch {
      // not a URL — assume it's already the code
      return raw;
    }
  }

  private verifyCode(decoded: string): void {
    const invoiceCode = this.extractInvoiceCode(decoded);
    if (!invoiceCode) {
      this.finishInvalid('Scanned data did not contain a valid invoice code.');
      return;
    }

    // call backend API: GET ${environment.apiUrl}/api/invoices/view/by-code/{invoiceCode}
    this.invoiceService.getInvoiceByCode(invoiceCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (invoice) => {
          // success — invoice found
          this.zone.run(() => {
            this.verifying = false;
            this.foundInvoice = invoice;
            this.message = `Invoice found (${invoice?.invoiceCode ?? invoiceCode}).`;
            this.onVerified.emit(invoice);

            // If backend provides bookingId (or booking.bookingId), navigate to invoice page
            const bookingId = invoice?.booking?.bookingId ?? invoice?.bookingId ?? invoice?.booking?.id ?? invoice?.bookingId;
            if (bookingId && !isNaN(+bookingId)) {
              // navigate to invoice page so user can view full invoice component
              try {
                this.router.navigate(['/invoice', bookingId], { queryParams: { code: invoiceCode } });
              } catch (navErr) {
                // navigation failure shouldn't block — just log
                console.warn('Navigation to invoice page failed', navErr);
              }
            }
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.verifying = false;
            // robust error messages
            if (!err || !err.status) {
              this.finishInvalid('Network error — could not reach server. Check connection.');
              return;
            }
            switch (err.status) {
              case 404:
                this.finishInvalid('Invoice not found (404). The code is invalid or the invoice was removed.');
                break;
              case 400:
                this.finishInvalid('Invalid request (400). Scanned code appears malformed.');
                break;
              case 403:
                this.finishInvalid('Access denied (403). You may not have permission to view this invoice.');
                break;
              case 422:
                this.finishInvalid('Unprocessable content (422). The scanned QR code is not a valid invoice reference.');
                break;
              case 500:
                this.finishInvalid('Server error (500). Try again later or contact support.');
                break;
              default:
                this.finishInvalid(`Unexpected error (${err.status}). ${err?.error?.message ?? ''}`);
            }
          });
        }
      });
  }

  public openFoundInvoice(): void {
    if (!this.foundInvoice) return;

    // emit the invoice object to parent
    this.onVerified.emit(this.foundInvoice);

    // try to resolve booking id from common locations
    const b = this.foundInvoice?.booking?.bookingId
           ?? this.foundInvoice.bookingId
           ?? this.foundInvoice?.booking?.id;

    if (b && !isNaN(+b)) {
      try {
        this.router.navigate(['/invoice', b], { queryParams: { code: this.foundInvoice.invoiceCode } });
      } catch (navErr) {
        console.warn('Navigation failed', navErr);
        // navigation error shouldn't crash the UI
      }
    }
  }

  private finishInvalid(userMsg: string) {
    this.message = userMsg;
    this.onInvalid.emit();
    this.foundInvoice = null;
    this.verifying = false;
    // reset lastDecodedText so user can rescan
    this.lastDecodedText = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // ensure camera stopped
    this.stopScanner();
  }
}
