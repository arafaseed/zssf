import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit, NgZone,ChangeDetectionStrategy,signal } from '@angular/core';
import jsPDF from 'jspdf';
import { ActivatedRoute, Router } from '@angular/router';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { InvoiceService, StaffDTO } from '../../Services/invoice.service';

@Component({
  selector: 'app-invoice',
  standalone: false,
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly panelOpenState = signal(false);
  bookingId!: number;
  invoiceData: any = {};
  staffList: StaffDTO[] = [];
  loading = true;

  qrDataUrl?: string;

  // installments
  installments: Array<{
    paymentId: number;
    paymentDate: string;
    paymentDateFormatted: string;
    amountPaid: number;
    paymentDescription?: string | null;
    label: string;
  }> = [];

  installmentsSum = 0;
  remainingAmount = 0;
  installmentsLoading = false;

  @ViewChild('a4wrapper', { static: false }) a4wrapperRef!: ElementRef<HTMLDivElement>;
  resizeObserver?: ResizeObserver;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private zone: NgZone,
    private router: Router
  ) {}

  // --- helpers ---
  private pad(n: number) { return n < 10 ? '0' + n : '' + n; }

  // returns dd-MM-yyyy (optionally with time if includeTime true)
  private formatDateString(iso: string | undefined | null, includeTime = false): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const datePart = `${this.pad(d.getDate())}-${this.pad(d.getMonth() + 1)}-${d.getFullYear()}`;
      if (!includeTime) return datePart;
      const timePart = `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}`;
      return `${datePart} ${timePart}`;
    } catch (e) {
      return String(iso);
    }
  }

  // ordinal label for installments
  private ordinal(n: number): string {
    const s = ["th","st","nd","rd"], v = n % 100;
    return n + (s[(v-20)%10] || s[v] || s[0]);
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.bookingId = +params['bookingId'];
      this.fetchInvoice();
      this.fetchInstallments();
    });
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.applyScaleToA4();
      // this.fetchInstallments();
    });
    this.resizeObserver.observe(document.body);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  fetchInvoice(): void {
    this.invoiceService.getInvoiceByBookingId(this.bookingId).subscribe({
      next: (data) => {
        this.invoiceData = this.normalizeInvoice(data);
        this.loading = false;
        this.fetchInstallments(this.invoiceData.controlNumber);
        this.fetchStaff(data.booking?.venueId ?? data.venueId ?? 0);
        this.createQRForInvoicePage(this.bookingId, this.invoiceData.invoiceCode);
        setTimeout(() => this.applyScaleToA4(), 200);
      },
      error: (err) => {
        console.error('Error fetching invoice:', err);
        this.loading = false;
      }
    });
  }

  private normalizeInvoice(data: any) {
    const root = { ...data };
    if (data.customer) {
      root.customerName = data.customer.customerName;
      root.customerPhone = data.customer.phoneNumber;
      root.customerEmail = data.customer.email;
    } else if (data.booking?.customer) {
      root.customerName = data.booking.customer.customerName;
      root.customerPhone = data.booking.customer.phoneNumber;
      root.customerEmail = data.booking.customer.email;
    }
    root.startDate = data.booking?.startDate ?? data.startDate;
    root.endDate = data.booking?.endDate ?? data.endDate;
    root.venueName = data.booking?.venueName ?? data.venueName;
    root.packageName = data.booking?.venueActivityName ?? data.packageName;
    root.amount = data.amount ?? data.netAmount ?? 0;
    return root;
  }

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

  private fetchInstallments(controlNumber?: string): void {
    if (!controlNumber) {
      this.installments = [];
      this.installmentsSum = 0;
      this.remainingAmount = (this.invoiceData?.netAmount ?? this.invoiceData?.amount ?? 0);
      return;
    }

    this.installmentsLoading = true;
    this.invoiceService.getPaymentsByControlNumber(controlNumber).subscribe({
      next: (payments) => {
        this.installments = payments.map((p: any, idx: number) => ({
          paymentId: p.paymentId,
          paymentDate: p.paymentDate,
          paymentDateFormatted: this.formatDateString(p.paymentDate, false),
          amountPaid: p.amountPaid ?? 0,
          paymentDescription: p.paymentDescription,
          label: `${this.ordinal(idx + 1)} installment`
        }));

        this.installmentsSum = this.installments.reduce((s, it) => s + (it.amountPaid || 0), 0);
        const invoiceTotal = this.invoiceData?.netAmount ?? this.invoiceData?.amount ?? 0;
        const remaining = invoiceTotal - this.installmentsSum;
        this.remainingAmount = remaining > 0 ? +remaining : 0;
        this.installmentsLoading = false;
      },
      error: (err) => {
        console.error('Error fetching installments:', err);
        this.installments = [];
        this.installmentsSum = 0;
        this.remainingAmount = (this.invoiceData?.netAmount ?? this.invoiceData?.amount ?? 0);
        this.installmentsLoading = false;
      }
    });
  }

  async createQRForInvoicePage(bookingId: number, invoiceCode?: string) {
    try {
      const safeCode = invoiceCode ? encodeURIComponent(invoiceCode) : '';
      const origin = (typeof window !== 'undefined' && window.location)
        ? (window.location.origin || `${window.location.protocol}//${window.location.host}`)
        : 'http://localhost:4200';
      const baseHref = typeof document !== 'undefined'
        ? (document.querySelector('base')?.getAttribute('href') ?? '/')
        : '/';
      const baseUrl = new URL(baseHref, origin).toString().replace(/\/$/, '');
      const url = `${baseUrl}/invoice/${bookingId}${safeCode ? `?code=${safeCode}` : ''}`;
      this.qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 200 });
    } catch (err) {
      console.error('QR creation error', err);
    }
  }


  async generatePDF(): Promise<void> {
  const invoiceEl = document.getElementById('invoice-a4');
  if (!invoiceEl) return;

  // Create pdf instance to get A4 dims in mm
  const pdf = new (jsPDF as any)('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();   // width in mm (210)
  const pageH = pdf.internal.pageSize.getHeight();  // height in mm (297)
  const marginMm = 10; // margin in mm (same as your print example)
  const contentW = pageW - marginMm * 2;
  const contentH = pageH - marginMm * 2;

  // Create an off-screen container with A4 width so html2canvas renders at that size
  const tempContainer = document.createElement('div');
  tempContainer.style.width = '210mm';           // force A4 width
  tempContainer.style.boxSizing = 'border-box';
  tempContainer.style.padding = `${marginMm}mm`; // match PDF margins
  tempContainer.style.background = '#ffffff';
  // keep it off-screen and not visible
  tempContainer.style.position = 'fixed';
  tempContainer.style.left = '-10000px';
  tempContainer.style.top = '0';
  // copy the invoice markup
  tempContainer.innerHTML = invoiceEl.outerHTML;

  document.body.appendChild(tempContainer);

  // allow the browser a moment to render (ensures fonts and images have layout)
  await new Promise((r) => setTimeout(r, 50));

  try {
    const canvas = await html2canvas(tempContainer, {
      scale: 2,        // increase quality
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');

    // Use canvas pixel dimensions to keep aspect ratio, but fit into the PDF content box
    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const imgRatio = canvasW / canvasH;

    // compute final image size in mm to fit inside contentW x contentH
    let finalW = contentW;
    let finalH = finalW / imgRatio;

    if (finalH > contentH) {
      finalH = contentH;
      finalW = finalH * imgRatio;
    }

    // center the image on the page
    const x = (pageW - finalW) / 2;
    const y = (pageH - finalH) / 2;

    pdf.addImage(imgData, 'PNG', x, y, finalW, finalH);
    const filename = `${(this as any).invoiceData?.invoiceCode || 'invoice'}.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error('PDF generation failed', err);
  } finally {
    // cleanup
    tempContainer.remove();
  }
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


  // When staff card clicked - dial or copy to clipboard
  callStaff(phone?: string) {
    if (!phone) return;
    // try to open phone dialer where supported
    window.location.href = `tel:${phone}`;
  }

  // Navigate to feedback page with pre-filled query params
  goToFeedback(): void {
    const qp: any = {
      name: this.invoiceData?.customerName || '',
      email: this.invoiceData?.customerEmail || '',
      phone: this.invoiceData?.customerPhone || ''
    };
    this.router.navigate(['/feedback'], { queryParams: qp });
  }

  // Keep A4 always proportioned and scale to available space (small screens)
  applyScaleToA4(): void {
    try {
      const wrapper = this.a4wrapperRef?.nativeElement;
      if (!wrapper) return;
      const a4 = wrapper.querySelector('.invoice-container') as HTMLElement;
      if (!a4) return;

      // physical A4 width in pixels at current device DPI is approximated by getBoundingClientRect
      const a4Px = a4.getBoundingClientRect().width;
      const parentWidth = wrapper.parentElement?.getBoundingClientRect().width ?? window.innerWidth;
      // allow some margin for gutters
      const available = Math.max(parentWidth - 32, 200);

      // prefer scale <= 1 so it visually remains A4; on very small screens scale down
      const scale = Math.min(1, available / a4Px);

      a4.style.transformOrigin = 'top center';
      a4.style.transition = 'transform 150ms ease';
      a4.style.transform = `scale(${scale})`;
      // set wrapper height so surrounding layout preserves space (approx)
      const a4Height = a4.getBoundingClientRect().height;
      wrapper.style.height = `${a4Height * scale}px`;
    } catch (e) {
      // silent fail
    }
  }
}
