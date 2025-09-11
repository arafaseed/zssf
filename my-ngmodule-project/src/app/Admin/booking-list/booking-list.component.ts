// src/app/components/booking-list/booking-list.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { BookingService, Booking, CustomerType } from '../../Services/booking.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { PdfViewerDialogComponent } from '../pdf-viewer-dialog/pdf-viewer-dialog.component';

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
      case 'CANCELLED':
      case 'EXPIRED': return 'red';
      case 'IN_PROGRESS': return 'green';
      case 'COMPLETE': return 'blue';
      case 'PENDING': return 'goldenrod';
      default: return 'black';
    }
  }

  openReferenceDocs(booking: Booking) {
    const docs = booking.customer?.referenceDocument ?? [];
    this.dialog.open(PdfViewerDialogComponent, {
      width: '80vw',
      maxWidth: '1200px',
      height: '80vh',
      data: { bookingId: booking.bookingId, docs, bookingCode: booking.bookingCode }
    });
  }
}
