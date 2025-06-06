import { Component, OnInit } from '@angular/core';
import { StaffBookingService, BookingDTO, VenueHandOverDTO } from '../../staff-booking.service';

@Component({
  selector: 'app-check-out-list',
  standalone: false,
  templateUrl: './check-out-list.component.html',
  styleUrls: ['./check-out-list.component.css']
})
export class CheckOutListComponent implements OnInit {
  bookings: BookingDTO[] = [];
  loading = true;
  errorMessage: string | null = null;

//   private venueId!: number;
//   private staffIDN!: string;

  public venueId!: number;
  public staffIDN!: string;

  // And the modal flags:
  public showModal = false;
  public selectedBooking!: BookingDTO;

//   // For modal
//   showModal = false;
//   selectedBooking!: BookingDTO;

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

    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    // 1) Fetch completed bookings
    this.bookingService.getCompletedBookingsByVenue(this.venueId).subscribe({
      next: (completedBookings) => {
        // 2) Fetch all handovers for this venue
        this.bookingService.getVenueHandOvers(this.venueId).subscribe({
          next: (handovers) => {
            // Build a set of bookingIds that have been checked in
            const checkedInSet = new Set<number>(
              handovers.filter(h => h.checkInTime && !h.checkOutTime)
                       .map(h => h.forBooking)
            );

            // Now filter completed bookings to those that have been checked-in but not yet checked-out
            const toCheckOut = completedBookings
              .filter(b => checkedInSet.has(b.bookingId))
              // Sort by bookingDate descending
              .sort((a, b) => {
                const da = new Date(a.bookingDate).getTime();
                const db = new Date(b.bookingDate).getTime();
                return db - da;
              });

            this.bookings = toCheckOut;
            this.loading = false;
          },
          error: (err) => {
            this.errorMessage = 'Failed to load handover records.';
            console.error(err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Failed to load completed bookings.';
        console.error(err);
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
    // Remove from list and close modal
    this.bookings = this.bookings.filter(b => b.bookingId !== this.selectedBooking.bookingId);
    this.showModal = false;
  }
}
