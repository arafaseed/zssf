import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit, NgZone } from '@angular/core';
import jsPDF from 'jspdf';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { InvoiceService, StaffDTO } from '../Services/invoice.service';

@Component({
  selector: 'app-invoice',
  standalone: false,
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
})
export class InvoiceComponent implements OnInit, AfterViewInit, OnDestroy {
  bookingId!: number;
  invoiceData: any;
  staffList: StaffDTO[] = [];
  loading = true;

  qrDataUrl?: string;

  // scanning/modal
  showScannerModal = false;
  scannedInvoice: any = null;
  showScannedModal = false;
  invalidScanMsg = '';

  @ViewChild('a4wrapper', { static: false }) a4wrapperRef!: ElementRef<HTMLDivElement>;

  resizeObserver?: ResizeObserver;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.bookingId = +params['bookingId'];
      this.fetchInvoice();
    });
  }

  ngAfterViewInit(): void {
    // observe viewport resize to rescale the A4 wrapper
    this.resizeObserver = new ResizeObserver(() => {
      this.applyScaleToA4();
    });
    this.resizeObserver.observe(document.body);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  fetchInvoice(): void {
    this.invoiceService.getInvoiceByBookingId(this.bookingId).subscribe({
      next: (data) => {
        // If your backend wraps data differently adjust accordingly
        this.invoiceData = this.normalizeInvoice(data);
        this.loading = false;
        this.fetchStaff(data.booking?.venueId ?? data.venueId ?? 0);
        // generate QR for this invoice — now QR points to the invoice page URL
        this.createQRForInvoicePage(this.bookingId, this.invoiceData.invoiceCode);
        // apply initial scale
        setTimeout(() => this.applyScaleToA4(), 200);
      },
      error: (err) => {
        console.error('Error fetching invoice:', err);
        this.loading = false;
      }
    });
  }

  // Keep existing logic but robustly find venueId
  private fetchStaff(venueId: number): void {
    if (!venueId) return;
    this.invoiceService.getStaffByAssignedVenue(venueId).subscribe({
      next: staff => {
        this.staffList = staff.filter(s => s.fullName !== 'Default Admin');
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching staff:', err);
        this.loading = false;
      }
    });
  }

  private normalizeInvoice(data: any) {
    // If your API returns nested booking/customer; for template convenience map top-level fields:
    const root = { ...data };
    // Ensure we have customerName, customerPhone etc.
    if (data.customer) {
      root.customerName = data.customer.customerName;
      root.customerPhone = data.customer.phoneNumber;
      root.customerEmail = data.customer.email;
    } else if (data.booking?.customer) {
      root.customerName = data.booking.customer.customerName;
      root.customerPhone = data.booking.customer.phoneNumber;
      root.customerEmail = data.booking.customer.email;
    }
    // Event start / end use booking fields if available
    root.startDate = data.booking?.startDate ?? data.startDate;
    root.endDate = data.booking?.endDate ?? data.endDate;
    root.venueName = data.booking?.venueName ?? data.venueName;
    root.packageName = data.booking?.venueActivityName ?? data.packageName;
    root.amount = data.amount ?? data.netAmount;
    return root;
  }

  /**
   * Create a QR that encodes the invoice page URL so scanners on other devices will
   * open this invoice directly. We include the invoiceCode as a query param for reliability.
   *
   * Example generated URL:
   *   http://localhost:4200/invoice/23?code=INVOICECODE123
   */
  async createQRForInvoicePage(bookingId: number, invoiceCode?: string) {
    try {
      const origin = window.location.origin || 'http://localhost:4200';
      const safeCode = invoiceCode ? encodeURIComponent(invoiceCode) : '';
      const url = `${origin}/invoice/${bookingId}${safeCode ? `?code=${safeCode}` : ''}`;
      // encode the full URL in QR so other devices can open it in browser
      this.qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 200 });
    } catch (err) {
      console.error('QR creation error', err);
    }
  }

  generatePDF(): void {
    const element = document.getElementById('invoice-a4');
    if (!element) {
      return;
    }

    // Use html2canvas with scale 2 to increase quality for A4
    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions in mm
      const imgProps = (canvas as any);
      const pxToMm = (px: number) => px * 0.2645833333; // 1px ≈ 0.264583 mm at 96dpi
      const imgW = pxToMm(canvas.width);
      const imgH = pxToMm(canvas.height);

      // Fit width
      const scale = Math.min(pageW / imgW, pageH / imgH);
      const finalW = imgW * scale;
      const finalH = imgH * scale;
      const x = (pageW - finalW) / 2;
      const y = (pageH - finalH) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalW, finalH);
      pdf.save(`${this.invoiceData.invoiceCode}.pdf`);
    });
  }

  printInvoice(): void {
    const invoiceEl = document.getElementById('invoice-a4');
    if (!invoiceEl) return;

    const popup = window.open('', '_blank', 'width=900,height=1200');
    if (!popup) return;

    const clonedHead = Array.from(document.head.querySelectorAll('link, style'))
      .map(el => el.outerHTML)
      .join('');

    popup.document.open();
    popup.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Print Invoice</title>
          ${clonedHead}
          <style>
            @page { size: A4; margin: 10mm; }
            body { margin: 0; display:flex; justify-content:center; align-items:flex-start; }
            .invoice-wrap { width:210mm; box-sizing:border-box; }
          </style>
        </head>
        <body>
          <div class="invoice-wrap">
            ${invoiceEl.outerHTML}
          </div>
        </body>
      </html>
    `);
    popup.document.close();

    popup.onload = () => {
      popup.focus();
      popup.print();
      popup.close();
    };
  }

  openScannerModal(): void {
    this.showScannerModal = true;
    this.invalidScanMsg = '';
  }

  onScannedVerified(invoice: any): void {
    // show modal with invoice data rendered
    this.scannedInvoice = invoice;
    this.showScannedModal = true;
    this.showScannerModal = false;
  }

  onScannedInvalid(): void {
    this.invalidScanMsg = 'Invalid invoice QR code / Invoice not found';
    this.showScannerModal = false;
  }

  closeScannedModal(): void {
    this.scannedInvoice = null;
    this.showScannedModal = false;
  }

  // Keep A4 always proportioned and scale to available space
  applyScaleToA4(): void {
    try {
      const wrapper = this.a4wrapperRef?.nativeElement;
      if (!wrapper) return;
      // find the inner element that is set to 210mm width
      const a4 = wrapper.querySelector('.invoice-container') as HTMLElement;
      if (!a4) return;

      // a4.clientWidth is the CSS computed pixel width for 210mm
      const a4Px = a4.getBoundingClientRect().width;
      // compute available width in parent container (wrapper)
      const parentWidth = wrapper.parentElement?.getBoundingClientRect().width ?? window.innerWidth;
      // allow some margin for gutters
      const available = Math.max(parentWidth - 40, 200);
      const scale = Math.min(1, available / a4Px);

      // apply transform scale and center
      a4.style.transformOrigin = 'top center';
      a4.style.transition = 'transform 150ms ease';
      a4.style.transform = `scale(${scale})`;
      // to avoid overflow layout shift set wrapper height to scaled height
      const a4Height = a4.getBoundingClientRect().height;
      wrapper.style.height = `${a4Height * scale}px`;
    } catch (e) {
      // silent fail
    }
  }
}
