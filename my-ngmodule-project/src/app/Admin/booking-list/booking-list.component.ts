// src/app/components/booking-list/booking-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { BookingService, Booking, CustomerType } from '../../Services/booking.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerOverlayComponent } from '../pdf-viewer-overlay/pdf-viewer-overlay.component';

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

  // filter state
  currentStatus: string = 'ALL';
  currentCustomerType: 'ALL' | CustomerType = 'ALL';
  searchDate: string = ''; // ISO string yyyy-MM-dd

  customerTypeOptions: Array<'ALL' | CustomerType> = ['ALL', 'INDIVIDUAL', 'ORGANIZATION'];
  statusOptions = ['ALL', 'EXPIRED', 'PENDING', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED'];

  loading = false;
  errorMessage = '';

   /* ----------------- OVERLAY CONTROL PROPS (NEW) ----------------- */
  
    /** flag controlling visibility of the overlay component */
    showPdfOverlay = false;
  
    /** docs passed to overlay */
    selectedDocs: string[] = [];
  
    /** selected booking info passed to overlay */
    selectedBookingId?: number;
    selectedBookingCode?: string;
    pdfAuthToken?: string;
  
    /** ViewChild reference to call overlay cleanup before hiding */
    @ViewChild('pdfOverlay') pdfOverlay?: PdfViewerOverlayComponent;
  
    /* --------------------------------------------------------------- */

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
        // ensure predictable ordering by startDate
        this.bookings = data.sort((a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

        // If venueName or activity missing, they may already be present in backend response.
        // We keep the values from backend if provided.
        this.dataSource.data = [...this.bookings];
        this.applyFilters(); // initial filter application
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load bookings';
        console.error(err);
        this.loading = false;
      }
    });
  }

  // simple helper to format date strings (YYYY-MM-DD) into local display
  formatDate(d?: string | null): string {
    if (!d) return '';
    return d; // keep the raw ISO date string; adapt if you want localized formatting
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
    // If using native <input type="date"> value will be yyyy-MM-dd
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
      // match by startDate or bookingDate? The user asked search by date; we'll match startDate as before.
      // If you want bookingDate, change b.startDate -> b.bookingDate
      filtered = filtered.filter(b => b.startDate === this.searchDate);
    }

    this.dataSource.data = filtered;
    // reset paginator to first page after filter
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

   /**
   * Previously opened the Pdf viewer as a MatDialog.
   * Now we set selected docs and show the overlay component in the DOM.
   * This ONLY changes how the viewer is shown — logic for extracting docs is unchanged.
   */
  openReferenceDocs(booking: any) {
    const docs = booking?.customer?.referenceDocument ?? [];

    // set selected context
    this.selectedDocs = docs;
    this.selectedBookingId = booking?.bookingId ?? null;
    this.selectedBookingCode = booking?.bookingCode ?? null;

    // optional: set auth token if your app needs to pass it to overlay (JWT etc.)
    // this.pdfAuthToken = this.authService.getToken();

    // show overlay
    this.showPdfOverlay = true;

    // If you used to open MatDialog, that code is intentionally removed.
  }

  /**
   * Close the overlay — call overlay cleanup then hide it.
   * We call the overlay's `close()` method (which clears blob resources)
   * and then set the flag to false so the parent removes it from DOM.
   */
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

}
