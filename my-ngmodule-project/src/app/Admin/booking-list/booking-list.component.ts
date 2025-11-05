import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { BookingService, Booking, CustomerType } from '../../Services/booking.service';
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
    'phoneNumber', // new column
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
  searchDate: string = ''; // ISO string yyyy-MM-dd

  customerTypeOptions: Array<'ALL' | CustomerType> = ['ALL', 'INDIVIDUAL', 'ORGANIZATION'];
  statusOptions = ['ALL', 'EXPIRED', 'PENDING', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED'];

  loading = false;
  errorMessage = '';

  /** Overlay control */
  showPdfOverlay = false;
  selectedDocs: string[] = [];
  selectedBookingId?: number;
  selectedBookingCode?: string;
  pdfAuthToken?: string;
  @ViewChild('pdfOverlay') pdfOverlay?: PdfViewerOverlayComponent;

  constructor(
    private bookingService: BookingService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBookings();
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

  applyFilters() {
    let filtered = [...this.bookings];

    if (this.currentStatus && this.currentStatus !== 'ALL') {
      filtered = filtered.filter(b => b.bookingStatus === this.currentStatus);
    }

    if (this.currentCustomerType && this.currentCustomerType !== 'ALL') {
      filtered = filtered.filter(b => b.customer?.customerType === this.currentCustomerType);
    }

    if (this.searchDate) {
      filtered = filtered.filter(b => b.startDate === this.searchDate);
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

  const printWindow = window.open('', '_blank');
  printWindow?.document.write('<html><head><title>Bookings</title>');
  printWindow?.document.write('<style>table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:left;}th{background:#0c1429;color:white;}</style>');
  printWindow?.document.write('</head><body>');
  printWindow?.document.write('<h2>Bookings</h2>');
  printWindow?.document.write(tableElement.outerHTML);
  printWindow?.document.write('</body></html>');
  printWindow?.document.close();
  printWindow?.print();
}
downloadTable() {
  const tableElement = document.querySelector('.table-wrapper') as HTMLElement;
  if (!tableElement) return;

  html2canvas(tableElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff', // set background to white
    onclone: (doc) => {
      // Fallback: replace unsupported oklch colors with standard rgb
      doc.querySelectorAll('*').forEach((el: any) => {
        const style = getComputedStyle(el);
        if (style.color.includes('oklch') || style.backgroundColor.includes('oklch')) {
          el.style.color = 'black';
          el.style.backgroundColor = 'white';
        }
      });
    },
  }).then(canvas => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 190;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let position = 10;
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    pdf.save('Bookings.pdf');
  });
}
}
