import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { BookingService, Booking, CustomerType } from '../../Services/booking.service';
import { ViewVenueService } from '../../Services/view-venue.service'; // 🔹 Add this import
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
  venueId: number = 0; // 🔹 Current venue filter selection

  venues: any[] = []; // 🔹 Store venue list

  customerTypeOptions: Array<'ALL' | CustomerType> = ['ALL', 'INDIVIDUAL', 'ORGANIZATION'];
  statusOptions = ['ALL', 'EXPIRED', 'PENDING', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED'];

  loading = false;
  errorMessage = '';

  showPdfOverlay = false;
  selectedDocs: string[] = [];
  selectedBookingId?: number;
  selectedBookingCode?: string;
  searchPhone: string = ''; // 🔹 new phone number filter
  pdfAuthToken?: string;
  @ViewChild('pdfOverlay') pdfOverlay?: PdfViewerOverlayComponent;

  constructor(
    private bookingService: BookingService,
    private viewVenueService: ViewVenueService, // 🔹 Inject service
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadVenues(); // 🔹 Load all venues
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

  // 🔹 Fetch all venues
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

    if (this.currentStatus !== 'ALL') {
      filtered = filtered.filter(b => b.bookingStatus === this.currentStatus);
    }

    if (this.currentCustomerType !== 'ALL') {
      filtered = filtered.filter(b => b.customer?.customerType === this.currentCustomerType);
    }

    if (this.searchDate) {
      filtered = filtered.filter(b => b.startDate === this.searchDate);
    }
    
    if (this.searchPhone) {
    filtered = filtered.filter(b => 
      b.customer?.phoneNumber?.toString().includes(this.searchPhone)
    );
  }

    // 🔹 Apply venue filter
    if (this.venueId && this.venueId !== 0) {
      filtered = filtered.filter(b => b.venueId === this.venueId);
    }

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
    try {
      this.pdfOverlay?.close();
    } catch (e) {
      console.warn('Overlay cleanup failed or overlay not mounted yet', e);
    }
    this.showPdfOverlay = false;
    this.selectedDocs = [];
    this.selectedBookingId = undefined;
    this.selectedBookingCode = undefined;
  }

  printTable() {
  const tableElement = document.querySelector('.table-wrapper');
  if (!tableElement) return;

  const reportTitle = 'My Booking System';
  const currentDateTime = new Date().toLocaleString();
  const heading = this.venueId && this.venueId !== 0
    ? `Bookings for Venue: ${this.venues.find(v => v.venueId === this.venueId)?.venueName || ''}`
    : 'All Bookings';

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write('<html><head><title>' + reportTitle + '</title>');
  printWindow.document.write(`
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      table { width:100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
      th { background:#0c1429; color:white; }
      h1, h2 { margin: 0; padding: 0; }
      .header { display:flex; align-items:center; justify-content: space-between; }
      .logo { height: 50px; }
      .meta { font-size: 12px; color: #555; }
    </style>
  `);
  printWindow.document.write('</head><body>');

  // Header with logo, title and datetime
  printWindow.document.write(`
    <div class="header">
      <div><img class="logo" src="zssf.png" alt="Logo"></div>
      <div>
        <h1>${reportTitle}</h1>
        <div class="meta">Generated on: ${currentDateTime}</div>
      </div>
    </div>
    <h2>${heading}</h2>
  `);

  printWindow.document.write(tableElement.outerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}
downloadTable() {
  const reportTitle = 'ZSSF Hall Reservation System';
  const currentDateTime = new Date().toLocaleString();

  // Build filter summary
  const venueName = this.venueId && this.venueId !== 0 
    ? this.venues.find(v => v.venueId === this.venueId)?.venueName || '-' 
    : 'All Venues';
  const statusFilter = this.currentStatus !== 'ALL' ? this.currentStatus : 'All Statuses';
  const customerTypeFilter = this.currentCustomerType !== 'ALL' ? this.currentCustomerType : 'All Types';
  const phoneFilter = this.searchPhone || 'Any Phone';

  const heading = `Filtered by: Venue: ${venueName} | Status: ${statusFilter} | Customer Type: ${customerTypeFilter} | Phone: ${phoneFilter}`;

  const container = document.createElement('div');
  container.style.background = '#ffffff';
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';

  // Centered logo and title
  container.innerHTML = `
    <div style="text-align:center; margin-bottom:10px;">
      <img src="zssf.png" alt="Logo" style="height:70px; display:block; margin:0 auto 10px auto;">
      <h1 style="margin:0; font-size:24px;">${reportTitle}</h1>
      <small>Generated on: ${currentDateTime}</small>
    </div>
    <h2 style="font-size:16px; margin-bottom:15px;">${heading}</h2>
  `;

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginTop = '10px';
  table.style.fontSize = '13px'; // slightly bigger font

  // Columns without 'reference'
  const columnsToShow = this.displayedColumns.filter(col => col !== 'reference');

  // Table header
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  columnsToShow.forEach(col => {
    const th = document.createElement('th');
    th.innerText = col.charAt(0).toUpperCase() + col.slice(1); // prettify header
    th.style.border = '1px solid #ccc';
    th.style.padding = '8px';
    th.style.background = '#0c1429';
    th.style.color = '#fff';
    th.style.fontSize = '14px'; // bigger header
    headerRow.appendChild(th);
  });

  // Table body
  const tbody = table.createTBody();
  this.dataSource.data.forEach(row => {
    const tr = tbody.insertRow();
    columnsToShow.forEach(col => {
      const td = tr.insertCell();
      let value: any = '-';

      switch (col) {
        case 'bookingCode': value = row.bookingCode; break;
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
      td.style.fontSize = '13px';
      td.style.color = '#000';
    });
  });

  container.appendChild(table);

  container.style.position = 'fixed';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    .then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('Bookings.pdf');

      document.body.removeChild(container);
    })
    .catch(err => console.error('html2canvas error', err));
}


}