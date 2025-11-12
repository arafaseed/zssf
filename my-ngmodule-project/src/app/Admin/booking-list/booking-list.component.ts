import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { BookingService, Booking, CustomerType } from '../../Services/booking.service';
import { ViewVenueService } from '../../Services/view-venue.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerOverlayComponent } from '../pdf-viewer-overlay/pdf-viewer-overlay.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-booking-list',
  standalone: false,
  templateUrl: './booking-list.component.html',
  styleUrls: ['./booking-list.component.css']
})
export class BookingListComponent implements OnInit, AfterViewInit {
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
  currentUser: string = 'System User';

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

  constructor(
    private bookingService: BookingService,
    private viewVenueService: ViewVenueService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadVenues();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadBookings(): void {
    this.loading = true;
    this.bookingService.fetchBookings().subscribe({
      next: (data) => {
        this.bookings = data.sort((a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        this.dataSource.data = [...this.bookings];
        this.applyFilters();
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

    const cols = this.displayedColumns.filter(c => c !== 'customerType');
    if (this.currentCustomerType === 'ALL') {
      cols.splice(6, 0, 'customerType');
    }
    this.displayedColumns = [...cols];

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

printTable() {
  const now = new Date();
  const currentDateTime = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  const mainTitle = 'ZANZIBAR SOCIAL SECURITY FUND'; // Main title
  const heading = 'BOOKING REPORT'; // Subtitle
  const columnsToShow = this.buildColumnsToShow();
  const table = this.generateReportTable(columnsToShow);

  // Remove unwanted rows
  const filteredElements = table.querySelectorAll('.mat-mdc-no-data-row, .filtered, .no-data');
  filteredElements.forEach(el => el.remove());

  const printWindow = window.open('');
  if (!printWindow) return;

  const logoPath = window.location.origin + '/zssf.png';

  printWindow.document.write(`
    <html>
      <head>
        <title>${mainTitle}</title>
        <style>
          @page { margin: 60px 40px 100px 40px; }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
          }

          /* HEADER */
          .report-header {
            text-align: center;
            margin: 5px 0 20px 0;
          }
          .report-header img {
            height: 100px;
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

          /* TABLE */
          table {
            width: 100%;
            // border-collapse: collapse;
            margin-bottom: 80px; /* space above footer */
          }
          th, td {
            border: 1px solid #000;
            padding: 7px;
            font-size: 13px;
            text-align: left;
            word-wrap: break-word;
          }
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }

          /* FOOTER */
          footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 2px solid #004d00;
            background: #f9f9f9;
            font-size: 14px; 
            padding: 2px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #333;
            font-weight: 500;
          }

          .footer-left { text-align: left; }
          .footer-right { text-align: right; }

          @media print {
            footer { position: fixed; bottom: 0; }
            /* Hide unwanted rows */
            .filtered, .mat-mdc-no-data-row, .no-data { display: none !important; }
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
          <div class="footer-left">Printed by: ${this.currentUser} | Generated on: ${currentDateTime}</div>
          <div class="footer-right"></div>
        </footer>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
  };
}



  // ✅ FIXED DOWNLOAD PDF FUNCTION (footer always visible)
  downloadTable() {
    const now = new Date();
    const currentDateTime = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const reportTitle = 'ZANZIBAR SOCIAL SECURITY FUND (ZSSF)';
    const heading = this.buildReportInfo();
    const columnsToShow = this.buildColumnsToShow();

    const container = document.createElement('div');
    container.style.background = '#fff';
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.innerHTML = `
      <div style="text-align:center;">
        <img src="zssf.png" style="height:70px; margin-top:10px;">
        <h1 style="margin-bottom:5px;">${reportTitle}</h1>
        <p style="font-size:14px; font-weight:500;">${heading}</p>
      </div>
    `;

    const table = this.generateReportTable(columnsToShow);
    container.appendChild(table);

    const footer = document.createElement('div');
    footer.innerHTML = `<p style="text-align:center; margin-top:2px; font-size:12px;">Generated on: ${currentDateTime} | Downloaded by: ${this.currentUser}</p>`;
    container.appendChild(footer);

    container.style.position = 'fixed';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    html2canvas(container, { scale: 3, useCORS: true, backgroundColor: '#fff' })
      .then(canvas => {
        const pdf = new jsPDF('p', 'mm', 'a3');
        const imgData = canvas.toDataURL('zssf.png');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight + 10;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('Bookings_A3.pdf');
        document.body.removeChild(container);
      })
      .catch(err => console.error(err));
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
