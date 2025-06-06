import { Component, OnInit } from '@angular/core';
import { StaffBookingService, BookingDTO, VenueHandOverDTO } from '../../staff-booking.service';

@Component({
  selector: 'app-check-in-list',
  standalone: false,
  templateUrl: './check-in-list.component.html',
  styleUrls: ['./check-in-list.component.css']
})
export class CheckInListComponent implements OnInit {
  bookings: BookingDTO[] = [];
  loading = true;
  errorMessage: string | null = null;

  private venueId!: number;
  private staffIDN!: string;

  constructor(private bookingService: StaffBookingService) {}

  ngOnInit(): void {
    // 1) Retrieve from sessionStorage
    const vid = sessionStorage.getItem('activeVenueId');
    const sidn = sessionStorage.getItem('auth-username');

    if (!vid || !sidn) {
      this.errorMessage = 'Venue or Staff IDN not found in session. Please log in again.';
      this.loading = false;
      return;
    }

    this.venueId = +vid;
    this.staffIDN = sidn;

    // 2) Load data
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    // Make parallel requests: completed bookings & existing handovers
    this.bookingService.getCompletedBookingsByVenue(this.venueId).subscribe({
      next: (completedBookings) => {
        this.bookingService.getVenueHandOvers(this.venueId).subscribe({
          next: (handovers) => {
            const checkedInSet = new Set<number>(
              handovers.map(h => h.forBooking)
            );

            // Filter out already checked-in bookings
            const pending = completedBookings
              .filter(b => !checkedInSet.has(b.bookingId))
              // Sort by bookingDate descending (most recent first)
              .sort((a, b) => {
                const dateA = new Date(a.bookingDate);
                const dateB = new Date(b.bookingDate);
                return dateB.getTime() - dateA.getTime();
              });

            this.bookings = pending;
            this.loading = false;
          },
          error: (err) => {
            this.errorMessage = 'Failed to load check-in records.';
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

  onCheckIn(booking: BookingDTO): void {
    this.bookingService.checkIn(booking.bookingCode, this.staffIDN).subscribe({
      next: () => {
        // Remove from list so it disappears
        this.bookings = this.bookings.filter(b => b.bookingId !== booking.bookingId);
      },
      error: (err) => {
        console.error('Check-in failed', err);
        alert('Check-in failed: ' + (err.error?.message || err.message));
      }
    });
  }
}
