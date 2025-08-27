import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { StaffBookingService, BookingDTO } from '../../staff-booking.service';

@Component({
  selector: 'app-cancelled-list',
  standalone: false,
  templateUrl: './cancelled-list.component.html',
  styleUrls: ['./cancelled-list.component.css']
})
export class CancelledListComponent implements OnInit, OnDestroy {
  bookings: BookingDTO[] = [];
  loading = true;
  errorMessage: string | null = null;

  private venueId!: number;
  private sessionCheckSub!: Subscription;

  constructor(private bookingService: StaffBookingService) {}

  ngOnInit(): void {
    this.fetchVenueIdAndLoad();

    // Re-check sessionStorage every 10s to detect venue changes
    this.sessionCheckSub = interval(10000).subscribe(() => {
      const currentVenue = +sessionStorage.getItem('activeVenueId')!;
      if (this.venueId !== currentVenue) {
        this.venueId = currentVenue;
        this.loadData();
      }
    });
  }


  ngOnDestroy(): void {
    if (this.sessionCheckSub) {
      this.sessionCheckSub.unsubscribe();
    }
  }

  private fetchVenueIdAndLoad(): void {
    const venue = sessionStorage.getItem('activeVenueId');

    if (!venue) {
      this.errorMessage = 'Venue ID not found in session.';
      this.loading = false;
      return;
    }

    this.venueId = +venue;
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.bookingService.getCancelledBookingsByVenue(this.venueId).subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load cancelled bookings.';
        console.error(err);
        this.loading = false;
      }
    });
  }
}
