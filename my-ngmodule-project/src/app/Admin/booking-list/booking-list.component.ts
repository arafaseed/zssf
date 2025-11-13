import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { BookingService, Booking, CustomerType } from '../../Services/booking.service';
import { ViewVenueService } from '../../Services/view-venue.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerOverlayComponent } from '../pdf-viewer-overlay/pdf-viewer-overlay.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-booking-list',
  standalone: false,
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css']
})
export class BookingListComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'bookingCode',
    'bookingDate',
    'activity',
    'venue',
    'customer',
    'phoneNumber',
    'customerType',
    'startDate',
    'startTime',
    'endDate',
    'endTime',
    'status',
    'reference'
  ];

  dataSource = new MatTableDataSource<Booking>([]);
  bookings: Booking[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  currentStatus: string = 'ALL';
  currentCustomerType: 'ALL' | CustomerType = 'ALL';
  searchDate: string = '';
  venueId: number = 0;
  searchPhone: string = '';

  // 👇 Updated: hold both name and role
  currentUser: string = 'System User';
  currentUserRole: string = 'Viewer'; // default role

  venues: any[] = [];

  customerTypeOptions: Array<'ALL' | CustomerType> = ['ALL', 'INDIVIDUAL', 'ORGANIZATION'];
  statusOptions = ['ALL', 'EXPIRED', 'PENDING', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED'];

  loading = false;
  errorMessage = '';

  showPdfOverlay = false;
  selectedDocs: string[] = [];
  selectedBookingId?: number;
  selectedBookingCode?: string;
  pdfAuthToken?: string;
  @ViewChild('pdfOverlay') pdfOverlay?: PdfViewerOverlayComponent;

  private refreshSub?: Subscription;

  constructor(
    private bookingService: BookingService,
    private viewVenueService: ViewVenueService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadVenues();

    // 👇 Example: load current user info (replace with your actual login logic)
    const userData = localStorage.getItem('loggedInUser');
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUser = user.name || 'System User';
      this.currentUserRole = user.role || 'Viewer';
    }

    // ✅ Auto-refresh every 1 minute
    this.refreshSub = interval(60000).subscribe(() => {
      this.loadBookings(false);
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadBookings(resetFilters: boolean = true): void {
    this.loading = true;
    this.bookingService.fetchBookings().subscribe({
      next: (data) => {
        const sortedBookings = data.slice().sort((a, b) => {
          const dateA = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
          const dateB = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
          return dateB - dateA;
        });

        this.bookings = [...sortedBookings];
        this.dataSource.data = [...this.bookings];

        if (resetFilters) this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load bookings';
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadVenues(): void {
    this.viewVenueService.getAllVenues().subscribe({
      next: (vs: any[]) => {
        this.venues = (vs || []).map(v => ({
          venueId: v.venueId ?? v.id ?? 0,
          venueName: v.venueName ?? v.name ?? 'Unnamed Venue'
        }));
      },
      error: (err) => console.error('Failed to load venues', err)
    });
  }

  setVenueFilter(id: number) {
    this.venueId = id;
    this.applyFilters();
  }

  formatDate(d?: string | null): string {
    if (!d) return '';
    return d;
  }

  setStatus(status: string) {
    this.currentStatus = status;
    this.applyFilters();
  }

  setCustomerType(type: 'ALL' | CustomerType) {
    this.currentCustomerType = type;
    this.applyFilters();
  }

  onDateChange(ev: any) {
    this.searchDate = ev?.target?.value ?? '';
    this.applyFilters();
  }

  clearDate() {
    this.searchDate = '';
    this.applyFilters();
  }

  onPhoneChange(event: any) {
    this.searchPhone = event?.target?.value ?? '';
    this.applyFilters();
  }

  clearPhone() {
    this.searchPhone = '';
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.bookings];

    if (this.currentStatus !== 'ALL') filtered = filtered.filter(b => b.bookingStatus === this.currentStatus);
    if (this.currentCustomerType !== 'ALL') filtered = filtered.filter(b => b.customer?.customerType === this.currentCustomerType);
    if (this.searchDate) filtered = filtered.filter(b => b.startDate === this.searchDate);
    if (this.searchPhone) filtered = filtered.filter(b => b.customer?.phoneNumber?.toString().includes(this.searchPhone));
    if (this.venueId && this.venueId !== 0) filtered = filtered.filter(b => b.venueId === this.venueId);

    filtered.sort((a, b) => {
      const dateA = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
      const dateB = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
      return dateB - dateA;
    });

    this.dataSource.data = filtered;
    if (this.paginator) this.paginator.firstPage();
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'CANCELLED': return 'red';
      case 'EXPIRED': return 'red';
      case 'IN_PROGRESS': return 'blue';
      case 'COMPLETE': return 'green';
      case 'PENDING': return 'goldenrod';
      default: return 'black';
    }
  }

  openReferenceDocs(booking: any) {
    const docs = booking?.customer?.referenceDocument ?? [];
    this.selectedDocs = docs;
    this.selectedBookingId = booking?.bookingId ?? null;
    this.selectedBookingCode = booking?.bookingCode ?? null;
    this.showPdfOverlay = true;
  }

  closePdfPreview() {
    try { this.pdfOverlay?.close(); } catch(e) { console.warn(e); }
    this.showPdfOverlay = false;
    this.selectedDocs = [];
    this.selectedBookingId = undefined;
    this.selectedBookingCode = undefined;
  }

  private buildReportInfo() {
    const filtersApplied =
      this.venueId !== 0 ||
      this.currentStatus !== 'ALL' ||
      this.currentCustomerType !== 'ALL' ||
      this.searchPhone ||
      this.searchDate;

    let description = '';
    if (filtersApplied) {
      description = `Report of Bookings filtered by: 
      Venue (${this.venueId !== 0 ? this.venues.find(v => v.venueId === this.venueId)?.venueName : 'All'}), 
      Status (${this.currentStatus}), 
      Customer Type (${this.currentCustomerType}), 
      Phone (${this.searchPhone || 'All'}), 
      Start Date (${this.searchDate || 'All'})`;
    } else {
      description = 'Comprehensive Report of All Bookings';
    }

    return description;
  }

  private buildColumnsToShow() {
    let cols = this.displayedColumns.filter(c => c !== 'reference' && c !== 'bookingCode');
    if (this.currentCustomerType !== 'ALL') cols = cols.filter(c => c !== 'customerType');
    return cols;
  }

  // ================= PRINT FUNCTION =================
 printTable() {
  const now = new Date();
  const currentDateTime = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes().toString().padStart(2, '0')}`;
  const mainTitle = 'ZANZIBAR SOCIAL SECURITY FUND (ZSSF)';
  const heading = 'BOOKING REPORT';
  const columnsToShow = this.buildColumnsToShow();
  const table = this.generateReportTable(columnsToShow);

  const filteredElements = table.querySelectorAll('.mat-mdc-no-data-row, .filtered, .no-data');
  filteredElements.forEach(el => el.remove());

  const printWindow = window.open('');
  if (!printWindow) return;

  const logoPath = window.location.origin + '/zssf.png';
  const adminId = this.authService.getUsername() || 'Unknown Admin';
const printedByInfo = `${adminId}`;


  printWindow.document.write(`
    <html>
      <head>
        <title>${mainTitle}</title>
        <style>
          @page {
            size: A4 landscape; /* ✅ ensures wide table fits */
            margin: 60px 50px 100px 50px;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
          }
          .report-header {
            text-align: center;
            margin: 5px 0 20px 0;
          }
          .report-header img {
            height: 90px;
            margin-top: -5px;
          }
          .report-header h1 {
            margin: 5px 0;
            font-size: 26px;
            font-weight: bold;
            color: #004d00;
            text-transform: uppercase;
          }
          .report-header h2 {
            margin: 2px 0 15px 0;
            font-size: 22px;
            font-weight: bold;
            text-transform: uppercase;
            color: #004d00;
          }

          /* ✅ Table fixes */
         /* Table fixes */
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto; /* let columns grow with content */
  word-wrap: break-word;
}

th, td {
  border: 1px solid #000;
  padding: 10px; /* slightly larger for better spacing */
  font-size: 18px;
  text-align: left;
  vertical-align: top;
  min-width: 100px; /* ensures th/td don’t shrink too much */
}

th {
  background-color: #000;
  color: #fff;
  font-weight: bold;
}

/* Prevent column cutoff */
main {
  width: 100%;
  overflow-x: visible; /* allow table to expand horizontally in print */
}

@media print {
  thead {
    display: table-header-group; /* repeats header on each page */
  }
  tfoot {
    display: table-footer-group;
  }
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  table {
    page-break-inside: auto; /* allows rows to break naturally across pages */
  }
  tr {
    page-break-inside: avoid; /* prevents a row from being split */
    page-break-after: auto;
  }
}


          footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 2px solid #004d00;
            background: #f9f9f9;
            font-size: 14px;
            padding: 4px 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #333;
            font-weight: 500;
          }

          .footer-left { text-align: left; }
          .footer-right { text-align: right; }

          @media print {
            footer {
              position: fixed;
              bottom: 0;
            }
            thead {
              display: table-header-group; /* ✅ ensures table header repeats each page */
            }
            tfoot {
              display: table-footer-group;
            }
            body {
              -webkit-print-color-adjust: exact; /* ✅ keeps header color */
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <img src="${logoPath}" alt="ZSSF Logo">
          <h1>${mainTitle}</h1>
          <h2>${heading}</h2>
        </div>

        <main>
          ${table.outerHTML}
        </main>

        <footer>
          <div class="footer-left">
           ${printedByInfo} | Generated on: ${currentDateTime}
          </div>
          <div class="footer-right"></div>
        </footer>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.onload = () => printWindow.print();
}


  // ================= DOWNLOAD PDF (unchanged) =================
  downloadTable() {
  const now = new Date();
  const currentDateTime = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  const mainTitle = 'ZANZIBAR SOCIAL SECURITY FUND (ZSSF)';
  const heading = 'BOOKING REPORT';
  const columnsToShow = this.buildColumnsToShow();
  const table = this.generateReportTable(columnsToShow);

  // ✅ Remove extra rows
  const filteredElements = table.querySelectorAll('.mat-mdc-no-data-row, .filtered, .no-data');
  filteredElements.forEach(el => el.remove());

  // ✅ Style table
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.querySelectorAll('th, td').forEach(cell => {
    const el = cell as HTMLElement;
    el.style.border = '1px solid #000';
    el.style.padding = '6px';
    el.style.fontSize = '16px';
    el.style.textAlign = 'left';
    el.style.wordWrap = 'break-word';
  });
  table.querySelectorAll('th').forEach(th => {
    const el = th as HTMLElement;
    el.style.backgroundColor = '#000';
    el.style.color = '#fff';
    el.style.fontWeight = 'bold';
  });

  // ✅ Container
  const container = document.createElement('div');
  container.style.background = '#fff';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.width = '100%';

  const logoPath = window.location.origin + '/zssf.png';

  // ✅ Fetch admin credentials directly from AuthService
  const adminId = this.authService.getUsername() || 'Unknown Admin';
  const printedByInfo = `Admin ID: ${adminId} `;

  // ✅ Header
  container.innerHTML = `
    <div style="text-align:center; margin:10px 0 20px 0;">
      <img src="${logoPath}" style="height:90px; display:block; margin:0 auto;">
      <h1 style="margin:5px 0; font-size:26px; font-weight:bold; color:#004d00; text-transform:uppercase;">${mainTitle}</h1>
      <h2 style="margin:2px 0 15px 0; font-size:22px; font-weight:bold; color:#004d00; text-transform:uppercase;">${heading}</h2>
    </div>
  `;

  container.appendChild(table);

  // ✅ Footer
  const footer = document.createElement('div');
  footer.style.borderTop = '2px solid #004d00';
  footer.style.background = '#f9f9f9';
  footer.style.fontSize = '15px';
  footer.style.fontWeight = '500';
  footer.style.color = '#333';
  footer.style.padding = '8px 5px';
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'center';
  footer.style.marginTop = '20px';
  footer.innerHTML = `
    <div>${printedByInfo} | Generated on: ${currentDateTime}</div>
    <div></div>
  `;
  container.appendChild(footer);

  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '0';
  document.body.appendChild(container);

  // ✅ Capture and generate PDF
  html2canvas(container, {
    scale: 2.5,
    useCORS: true,
    backgroundColor: '#fff',
    scrollX: 0,
    scrollY: 0,
    windowWidth: container.scrollWidth,
    windowHeight: container.scrollHeight
  })
    .then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a3');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();

        // ✅ Repeat header on each page
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(mainTitle, pageWidth / 2, 20, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text(heading, pageWidth / 2, 30, { align: 'center' });

        // Add the same table slice again
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);

        // ✅ Footer on each page
        pdf.setFontSize(10);
        pdf.text(`${printedByInfo} | Generated on: ${currentDateTime}`, 14, pageHeight - 10);

        heightLeft -= pageHeight;
      }

      pdf.save('Booking_Report.pdf');
      document.body.removeChild(container);
    })
    .catch(err => {
      console.error(err);
      document.body.removeChild(container);
    });
}




  private generateReportTable(columnsToShow: string[]): HTMLTableElement {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '15px';
    table.style.fontSize = '13px';

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    columnsToShow.forEach(col => {
      const th = document.createElement('th');
      th.innerText = col.charAt(0).toUpperCase() + col.slice(1);
      th.style.border = '1px solid #ccc';
      th.style.padding = '8px';
      th.style.background = '#0c1429';
      th.style.color = '#fff';
      th.style.fontSize = '14px';
      headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    this.dataSource.data.forEach(row => {
      const tr = tbody.insertRow();
      columnsToShow.forEach(col => {
        const td = tr.insertCell();
        let value: any = '-';
        switch (col) {
          case 'bookingDate': value = row.bookingDate ? new Date(row.bookingDate).toLocaleDateString() : '-'; break;
          case 'activity': value = row.venueActivityName || '-'; break;
          case 'venue': value = row.venueName || '-'; break;
          case 'customer': value = row.customer?.customerName || '-'; break;
          case 'phoneNumber': value = row.customer?.phoneNumber || '-'; break;
          case 'customerType': value = row.customer?.customerType || '-'; break;
          case 'startDate': value = row.startDate ? new Date(row.startDate).toLocaleDateString() : '-'; break;
          case 'startTime': value = row.startTime || '-'; break;
          case 'endDate': value = row.endDate ? new Date(row.endDate).toLocaleDateString() : '-'; break;
          case 'endTime': value = row.endTime || '-'; break;
          case 'status': value = row.bookingStatus || '-'; break;
          default: value = (row as any)[col] ?? '-';
        }
        td.innerText = value;
        td.style.border = '1px solid #ccc';
        td.style.padding = '8px';
        td.style.color = '#000';
      });
    });

    return table;
  }
}

function autoTable(pdf: jsPDF, arg1: {
  head: string[][];
  body: string[][];
  startY: number;
  theme: string;
  headStyles: {
    fillColor: number[];
    textColor: number[];
    fontSize: number;
    halign: string;
  };
  bodyStyles: { fontSize: number; cellPadding: number; textColor: number[]; };
  styles: { lineColor: number[]; lineWidth: number; font: string; };
  alternateRowStyles: { fillColor: number[]; };
  margin: { top: number; left: number; right: number; };
  didDrawPage: () => void;
}) {
  throw new Error('Function not implemented.');
}
