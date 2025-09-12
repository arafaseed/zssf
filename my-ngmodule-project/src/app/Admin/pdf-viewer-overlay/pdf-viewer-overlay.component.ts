import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pdf-viewer-overlay',
  standalone: false,
  templateUrl: './pdf-viewer-overlay.component.html',
  styleUrls: ['./pdf-viewer-overlay.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfViewerOverlayComponent implements OnInit, OnDestroy {
  /** input list of document URLs (strings). */
  @Input() docs: string[] = [];
  @Input() bookingId?: number | string;
  @Input() bookingCode?: string;
  /** Optional Bearer token (if you need to include auth header). */
  @Input() authToken?: string;

  /** index of selected doc */
  selectedIndex = -1;
  /** blob: url passed to ngx viewer */
  pdfBlobUrl: string | null = null;
  /** raw last blob (kept for explicit download) */
  private currentBlob: Blob | null = null;

  loading = false;
  error: string | null = null;

  private sub?: Subscription;

  /** expose closed event to parent */
  @Output() closed = new EventEmitter<void>();

  /** internal visibility flag so overlay can hide itself immediately */
  isOpen = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.docs?.length) {
      // load first doc
      this.selectDoc(0);
    }
  }

  /**
   * Select and load document by index.
   * Uses Cache Storage (if available) to avoid re-fetching.
   */
  async selectDoc(idx: number) {
    this.error = null;

    if (!this.docs || !this.docs[idx]) {
      this.clearCurrent();
      this.selectedIndex = -1;
      this.cdr.markForCheck();
      return;
    }

    const url = this.docs[idx];
    this.selectedIndex = idx;

    // Clear previously created blob url
    this.clearBlobUrl();

    this.loading = true;
    this.cdr.markForCheck();

    try {
      // 1) Try Cache Storage first (if available)
      let cachedResponse: Response | undefined;
      if ('caches' in window) {
        try {
          const cache = await (window as any).caches.open('pdf-viewer-cache-v1');
          cachedResponse = await cache.match(url);
          if (cachedResponse) {
            const cachedBlob = await cachedResponse.blob();
            // ensure type is set to application/pdf
            const pdfBlob = this.ensurePdfBlob(cachedBlob);
            this.useBlob(pdfBlob);
            this.loading = false;
            this.cdr.markForCheck();
            return;
          }
        } catch (cacheErr) {
          // if caches fails (permission), ignore and fetch
          console.warn('Cache check failed', cacheErr);
        }
      }

      // 2) Not cached — fetch via HttpClient so we can pass auth headers and cookies
      const headers = this.authToken
        ? new HttpHeaders({ Authorization: `Bearer ${this.authToken}` })
        : undefined;

      // unsubscribable observable
      this.sub = this.http
        .get(url, { responseType: 'blob', headers: headers as any })
        .subscribe({
          next: async (blob: Blob) => {
            // Wrap blob into application/pdf if needed
            const pdfBlob = this.ensurePdfBlob(blob);
            this.currentBlob = pdfBlob;
            this.createBlobUrlFromBlob(pdfBlob);

            // store in cache for future (non-blocking)
            if ('caches' in window) {
              try {
                // create Response with correct content-type header
                const responseInit: ResponseInit = {
                  status: 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'application/pdf' }
                };
                const response = new Response(pdfBlob, responseInit);
                const cache = await (window as any).caches.open('pdf-viewer-cache-v1');
                await cache.put(url, response.clone());
              } catch (cacheErr) {
                console.warn('Cache put failed', cacheErr);
              }
            }

            this.loading = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Failed to fetch PDF', err);
            this.loading = false;
            this.error = 'Failed to load document.';
            this.cdr.markForCheck();
          }
        });
    } catch (err) {
      console.error(err);
      this.loading = false;
      this.error = 'Unexpected error loading document.';
      this.cdr.markForCheck();
    }
  }

  /**
   * Ensure the blob is typed as application/pdf.
   * If the server already returned a pdf blob (type includes 'pdf'), return it unchanged.
   * Otherwise create a new Blob with type 'application/pdf' wrapping the original data.
   */
  private ensurePdfBlob(blob: Blob): Blob {
    try {
      if (blob && blob.type && blob.type.toLowerCase().includes('pdf')) {
        return blob;
      }
    } catch (e) {
      // fallthrough to recreate blob
    }
    // Recreate blob with application/pdf type to force inline viewing
    return new Blob([blob], { type: 'application/pdf' });
  }

  /** create blob url from blob and set viewer src */
  private createBlobUrlFromBlob(blob: Blob) {
    this.clearBlobUrl();
    this.currentBlob = blob;
    this.pdfBlobUrl = URL.createObjectURL(blob);
  }

  /** helper used when cache returned a Blob */
  private useBlob(blob: Blob) {
    this.createBlobUrlFromBlob(blob);
    this.currentBlob = blob;
  }

  /** Download the currently loaded PDF */
  downloadCurrent() {
    if (!this.currentBlob) {
      return;
    }
    const filename = this.deriveFilenameFromCurrent() || `document.pdf`;
    const a = document.createElement('a');
    // Use the existing blob url (pdfBlobUrl) if present; otherwise create a new one
    const url = this.pdfBlobUrl ?? URL.createObjectURL(this.currentBlob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // If we created a temporary URL (i.e., pdfBlobUrl was null), revoke it
    // but if pdfBlobUrl is our main viewer URL we DO NOT revoke here
    if (!this.pdfBlobUrl) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Print — loads the blob URL into a hidden iframe and triggers print preview.
   * Using the already-created blob URL ensures the browser displays the PDF and prints,
   * instead of re-downloading the remote file.
   */
  async printCurrent() {
    if (!this.currentBlob) return;
    const url = this.pdfBlobUrl ?? URL.createObjectURL(this.currentBlob);
    // Create an iframe that will load the blob url and print when loaded.
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.src = url;
    document.body.appendChild(iframe);

    const cleanup = () => {
      try {
        document.body.removeChild(iframe);
      } catch { /* ignore */ }
      if (!this.pdfBlobUrl) {
        // if we created a temporary URL just for printing, we should revoke it
        URL.revokeObjectURL(url);
      }
    };

    iframe.onload = () => {
      try {
        // Ask the iframe's window to print
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('Print failed', e);
      } finally {
        // small delay to let print dialog open
        setTimeout(cleanup, 600);
      }
    };
  }

  /** Choose a human-friendly filename from URL or booking info */
  private deriveFilenameFromCurrent(): string | null {
    const url = this.docs?.[this.selectedIndex] ?? '';
    try {
      const u = new URL(url);
      const name = u.pathname.split('/').pop();
      if (name) return name;
    } catch (_) {
      // not an absolute URL
    }
    // fallback to booking code
    if (this.bookingCode) {
      return `${this.bookingCode}.pdf`;
    }
    return null;
  }

  /** Close overlay — hides itself immediately, cleans resources, and emits closed event */
  close() {
    // Hide overlay immediately
    this.isOpen = false;

    // release resources
    this.clearCurrent();

    // emit event for parent to perform additional cleanup (like toggling *ngIf)
    try {
      this.closed.emit();
    } catch (e) {
      // swallow
    }
    // mark for change detection
    this.cdr.markForCheck();
  }

  /** release resources */
  private clearBlobUrl() {
    if (this.pdfBlobUrl) {
      try {
        URL.revokeObjectURL(this.pdfBlobUrl);
      } catch (e) {
        // ignore
      }
      this.pdfBlobUrl = null;
    }
  }

  /** cleanup */
  private clearCurrent() {
    this.sub?.unsubscribe();
    this.clearBlobUrl();
    this.currentBlob = null;
    this.selectedIndex = -1;
    this.loading = false;
    this.error = null;
  }

  ngOnDestroy(): void {
    this.clearCurrent();
  }
}
