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

  // Keep this typed as `any` because the library may not ship types
  private html5Qrcode: any = null;
  private Html5QrcodeClass: any = null; // holds the constructor/class after dynamic import

  scanning = false;
  message = '';

  constructor(private invoiceService: InvoiceService, private zone: NgZone) {}

  ngOnInit(): void {}

  /**
   * Start the scanner.
   * We dynamically import the html5-qrcode library to avoid TS import/type issues,
   * request camera permission first, then initialize and start the scanner.
   */
  async startScanner(): Promise<void> {
    if (this.scanning) return;

    if (!navigator?.mediaDevices?.getUserMedia) {
      this.message = 'Camera API not supported in this browser.';
      return;
    }

    try {
      // Ask camera permission explicitly (will prompt user)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop()); // stop temporary stream

      // Dynamic import avoids TypeScript import/type mismatch
      if (!this.Html5QrcodeClass) {
        const module = await import('html5-qrcode');
        // module may export the class as named or default; handle both
        this.Html5QrcodeClass = module?.Html5Qrcode ?? module?.default ?? module;
      }

      // get cameras (best-effort, may throw)
      let cameras: Array<{ id: string; label?: string }> = [];
      try {
        cameras = await this.Html5QrcodeClass.getCameras();
      } catch (e) {
        // ignore — fallback to facingMode below
      }

      let cameraId: string | undefined;
      if (cameras && cameras.length) {
        cameraId = cameras.find((c) => /back|rear|environment/i.test(c.label || ''))?.id || cameras[0].id;
      }

      const elementId = this.scannerElem.nativeElement.id || 'qr-scanner';
      this.html5Qrcode = new this.Html5QrcodeClass(elementId);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 } as any
      };

      // Explicitly type the error parameter as string to avoid implicit any
      await this.html5Qrcode.start(
        cameraId ?? ({ facingMode: 'environment' } as any),
        config,
        (decodedText: string) => {
          this.zone.run(() => {
            this.stopScanner();
            this.verifyCode(decodedText);
          });
        },
        (errorMessage: string) => {
          // We intentionally ignore per-frame decode errors, but typed as string
          // console.debug('decode error', errorMessage);
        }
      );

      this.scanning = true;
      this.message = '';
    } catch (err: any) {
      console.error('startScanner error', err);
      this.message = 'Failed to start camera: ' + (err?.message ?? String(err));
      this.scanning = false;
    }
  }

  async stopScanner(): Promise<void> {
    if (!this.html5Qrcode) {
      this.scanning = false;
      return;
    }
    try {
      await this.html5Qrcode.stop();
      await this.html5Qrcode.clear();
    } catch (err) {
      console.warn('stopScanner error', err);
    }
    this.scanning = false;
  }

  private extractInvoiceCode(raw: string): string | null {
    if (!raw) return null;
    try {
      const u = new URL(raw);
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length) return parts[parts.length - 1];
      return u.searchParams.get('code') ?? null;
    } catch {
      return raw.trim();
    }
  }

  private verifyCode(codeRaw: string) {
    const invoiceCode = this.extractInvoiceCode(codeRaw);
    if (!invoiceCode) {
      this.onInvalid.emit();
      return;
    }
    this.invoiceService.getInvoiceByCode(invoiceCode).subscribe({
      next: (invoice) => {
        if (invoice && invoice.invoiceCode) this.onVerified.emit(invoice);
        else this.onInvalid.emit();
      },
      error: () => this.onInvalid.emit()
    });
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }
}
