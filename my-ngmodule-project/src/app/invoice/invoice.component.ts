import { Component,OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import { ActivatedRoute } from '@angular/router';
import html2canvas from 'html2canvas';
import { InvoiceService,StaffDTO } from '../Services/invoice.service';

@Component({
  selector: 'app-invoice',
  standalone: false,
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css',

})
export class InvoiceComponent  {
  bookingId!: number;
  invoiceData: any;
  staffList: StaffDTO[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.bookingId = +params['bookingId'];
      this.fetchInvoice();
    });
  }

  fetchInvoice(): void {
    this.invoiceService.getInvoiceByBookingId(this.bookingId).subscribe({
      next: (data) => {
        this.invoiceData = data;
        this.loading = false;
        this.fetchStaff(data.venueId);
      },
      error: (err) => {
        console.error('Error fetching invoice:', err);
        this.loading = false;
      }
    });
  }

  private fetchStaff(venueId: number): void {
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


generatePDF(): void {
  const element = document.getElementById('invoice');
  if (!element) {
    return;
  }

  // Capture the styled DOM with html2canvas (scale 2 ⇒ sharp on A4)
  html2canvas(element, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf    = new jsPDF('p', 'pt', 'a4');
    const pageW  = pdf.internal.pageSize.getWidth();
    const pageH  = pdf.internal.pageSize.getHeight();

    // Auto‐resize image to full‐width and keep aspect ratio
    const ratio  = canvas.height / canvas.width;
    const imgH   = pageW * ratio;

    pdf.addImage(imgData, 'PNG', 0, 0, pageW, imgH);
    pdf.save(`${this.invoiceData.invoiceCode}.pdf`);
  });
}

printInvoice(): void {
  const invoiceEl = document.getElementById('invoice');
  if (!invoiceEl) return;

  // 1) Open a fresh blank popup
  const popup = window.open('', '_blank', 'width=800,height=600');
  if (!popup) return;

  // 2) Grab all of the page's existing <link> and <style> tags so the printout
  //    uses exactly the same CSS you’ve defined.
  const clonedHead = Array.from(document.head.querySelectorAll('link, style'))
    .map(el => el.outerHTML)
    .join('');

  // 3) Build the new document
  popup.document.open();
  popup.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Print Invoice</title>
        ${clonedHead}
        <style>
          /* Any print-only overrides go here */
          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          ${invoiceEl.innerHTML}
        </div>
      </body>
    </html>
  `);
  popup.document.close();

  // 4) Wait for the styles to load, then trigger print & close
  popup.onload = () => {
    popup.focus();
    popup.print();
    popup.close();
  };
}


}