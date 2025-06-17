import { Component, OnInit } from '@angular/core';
import { StaffBookingService, BookingDTO } from '../../staff-booking.service';

@Component({
  selector: 'app-check-out-list',
  standalone:false,
  templateUrl: './check-out-list.component.html',
  styleUrls: ['./check-out-list.component.css']
})
export class CheckOutListComponent implements OnInit {
  bookings: BookingDTO[] = [];
  loading = true;
  errorMessage: string | null = null;

  venueId!: number;
  staffIDN!: string;

  // Modal state
  showModal = false;
  selectedBooking!: BookingDTO;

  constructor(private bookingService: StaffBookingService) {}

  ngOnInit(): void {
    const vid = sessionStorage.getItem('activeVenueId');
    const sid = sessionStorage.getItem('auth-username');

    if (!vid || !sid) {
      this.errorMessage = 'Venue or Staff IDN missing. Please log in again.';
      this.loading = false;
      return;
    }

    this.venueId = +vid;
    this.staffIDN = sid;
    this.loadPendingCheckOuts();
  }

  private loadPendingCheckOuts(): void {
    this.loading = true;
    this.errorMessage = null;

    this.bookingService.getPendingCheckOuts(this.venueId).subscribe({
      next: (pending) => {
        // pending already filtered to “checked-in and not checked-out”
        this.bookings = pending
          // sort by bookingDate descending
          .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Could not load pending check‑outs.';
        this.loading = false;
      }
    });
  }

  openCheckoutModal(booking: BookingDTO): void {
    this.selectedBooking = booking;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onCheckedOut(): void {
    // Remove the booking from the list when checkout completes
    this.bookings = this.bookings.filter(b => b.bookingId !== this.selectedBooking.bookingId);
    this.showModal = false;
  }
}
