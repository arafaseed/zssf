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
  standalone:false,
  templateUrl: './pdf-viewer-overlay.component.html',
  styleUrls: ['./pdf-viewer-overlay.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfViewerOverlayComponent implements OnInit, OnDestroy {
  @Input() docs: string[] = [];
  @Input() bookingId?: number | string;
  @Input() bookingCode?: string;
  @Input() authToken?: string;

  selectedIndex = -1;
  pdfBlobUrl: string | null = null;

  // <-- made public so template can access it
  currentBlob: Blob | null = null;

  loading = false;
  error: string | null = null;
  viewerReady = false;

  private sub?: Subscription;

  @Output() closed = new EventEmitter<void>();
  isOpen = true;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.docs?.length) {
      this.selectDoc(0);
    }
  }

  async selectDoc(idx: number) {
    this.error = null;
    this.viewerReady = false;
    this.cdr.markForCheck();

    if (!this.docs || !this.docs[idx]) {
      this.clearCurrent();
      this.selectedIndex = -1;
      this.cdr.markForCheck();
      return;
    }

    const url = this.docs[idx];
    this.selectedIndex = idx;
    this.clearBlobUrl();
    this.loading = true;
    this.cdr.markForCheck();

    // debug
    // eslint-disable-next-line no-console
    // console.log('[pdf-viewer] selecting', url);

    try {
      if ('caches' in window) {
        try {
          const cache = await (window as any).caches.open('pdf-viewer-cache-v1');
          const cachedResp = await cache.match(url);
          if (cachedResp) {
            const cachedBlob = await cachedResp.blob();
            const pdfBlob = this.ensurePdfBlob(cachedBlob);
            await this.handleBlobForViewer(pdfBlob, url, true);
            return;
          }
        } catch (e) {
          console.warn('[pdf-viewer] cache check failed', e);
        }
      }

      const headers = this.authToken ? new HttpHeaders({ Authorization: `Bearer ${this.authToken}` }) : undefined;

      this.sub = this.http.get(url, { responseType: 'blob', headers: headers as any }).subscribe({
        next: async (blob: Blob) => {
          const pdfBlob = this.ensurePdfBlob(blob);
          await this.handleBlobForViewer(pdfBlob, url, false);

          if ('caches' in window) {
            try {
              const responseInit: ResponseInit = {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'application/pdf' }
              };
              const resp = new Response(pdfBlob, responseInit);
              const cache = await (window as any).caches.open('pdf-viewer-cache-v1');
              await cache.put(url, resp.clone());
            } catch (cacheErr) {
              console.warn('[pdf-viewer] cache put failed', cacheErr);
            }
          }
        },
        error: (err) => {
          console.error('[pdf-viewer] fetch failed', err);
          this.loading = false;
          this.error = 'Failed to load document (network).';
          this.cdr.markForCheck();
        }
      });
    } catch (err) {
      console.error('[pdf-viewer] unexpected', err);
      this.loading = false;
      this.error = 'Unexpected error loading document.';
      this.cdr.markForCheck();
    }
  }

  private async handleBlobForViewer(blob: Blob, sourceUrl: string, fromCache: boolean) {
    this.currentBlob = blob;
    // debug
    // eslint-disable-next-line no-console
    // console.log('[pdf-viewer] blob received size=', blob.size, ' type=', blob.type, ' fromCache=', fromCache, 'url=', sourceUrl);

    const looksLikePdf = await this.blobStartsWithPdf(blob);
    if (!looksLikePdf) {
      const textPreview = await this.readBlobAsTextSnippet(blob, 600);
      // eslint-disable-next-line no-console
      console.warn('[pdf-viewer] resource is not a PDF, preview:', textPreview);
      this.currentBlob = blob;
      this.createBlobUrlFromBlob(blob);
      this.loading = false;
      this.viewerReady = false;
      this.error = 'Server did not return a valid PDF (see DevTools Network).';
      this.cdr.markForCheck();
      return;
    }

    this.createBlobUrlFromBlob(blob);
    this.viewerReady = true;
    this.loading = false;
    this.cdr.markForCheck();
  }

  private ensurePdfBlob(blob: Blob): Blob {
    try {
      if (blob && blob.type && blob.type.toLowerCase().includes('pdf')) return blob;
    } catch {}
    return new Blob([blob], { type: 'application/pdf' });
  }

  private async blobStartsWithPdf(blob: Blob): Promise<boolean> {
    try {
      const slice = blob.slice(0, 8);
      const arr = await slice.arrayBuffer();
      const text = new TextDecoder().decode(arr);
      return text.includes('%PDF');
    } catch (e) {
      return false;
    }
  }

  private async readBlobAsTextSnippet(blob: Blob, maxChars = 600): Promise<string> {
    try {
      const arr = await blob.slice(0, maxChars).arrayBuffer();
      return new TextDecoder().decode(arr).substr(0, maxChars);
    } catch {
      return '[could not read blob]';
    }
  }

  private createBlobUrlFromBlob(blob: Blob) {
    this.clearBlobUrl();
    this.currentBlob = blob;
    this.pdfBlobUrl = URL.createObjectURL(blob);
    // debug
    // eslint-disable-next-line no-console
    // console.log('[pdf-viewer] created blob url', this.pdfBlobUrl, 'size', blob.size);
  }

  downloadCurrent() {
    if (!this.currentBlob) return;
    const filename = this.deriveFilenameFromCurrent() || 'document.pdf';
    const url = this.pdfBlobUrl ?? URL.createObjectURL(this.currentBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (!this.pdfBlobUrl) URL.revokeObjectURL(url);
  }

  async printCurrent() {
    if (!this.currentBlob) return;
    const url = this.pdfBlobUrl ?? URL.createObjectURL(this.currentBlob);
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
      try { document.body.removeChild(iframe); } catch {}
      if (!this.pdfBlobUrl) URL.revokeObjectURL(url);
    };

    iframe.onload = () => {
      try { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); }
      catch (e) { console.warn('[pdf-viewer] print failed', e); }
      finally { setTimeout(cleanup, 600); }
    };
  }

  private deriveFilenameFromCurrent(): string | null {
    const url = this.docs?.[this.selectedIndex] ?? '';
    try {
      const u = new URL(url);
      const name = u.pathname.split('/').pop();
      if (name) return name;
    } catch {}
    if (this.bookingCode) return `${this.bookingCode}.pdf`;
    return null;
  }

  close() {
    this.isOpen = false;
    this.clearCurrent();
    try { this.closed.emit(); } catch {}
    this.cdr.markForCheck();
  }

  private clearBlobUrl() {
    if (this.pdfBlobUrl) {
      try { URL.revokeObjectURL(this.pdfBlobUrl); } catch {}
      this.pdfBlobUrl = null;
    }
    this.viewerReady = false;
  }

  private clearCurrent() {
    this.sub?.unsubscribe();
    this.clearBlobUrl();
    this.currentBlob = null;
    this.selectedIndex = -1;
    this.loading = false;
    this.error = null;
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.clearCurrent();
  }
}
