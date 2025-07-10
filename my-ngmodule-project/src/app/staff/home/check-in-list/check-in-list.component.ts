import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import {
  StaffBookingService,
  BookingDTO,
  VenueHandOverDTO
} from '../../staff-booking.service';

interface EnrichedBooking extends BookingDTO {
  packageName: string;
  price: number;
  activityName: string;
}

@Component({
  selector: 'app-check-in-list',
  standalone:false,
  templateUrl: './check-in-list.component.html',
  styleUrls: ['./check-in-list.component.css']
})
export class CheckInListComponent implements OnInit {
  bookings: EnrichedBooking[] = [];
  loading = true;
  errorMessage: string | null = null;

  private venueId!: number;
  private staffIDN!: string;

  constructor(private bookingService: StaffBookingService) {}

  ngOnInit(): void {
    const vid = sessionStorage.getItem('activeVenueId');
    const sidn = sessionStorage.getItem('auth-username');

    if (!vid || !sidn) {
      this.errorMessage = 'Venue or Staff IDN not found in session. Please log in again.';
      this.loading = false;
      return;
    }

    this.venueId = +vid;
    this.staffIDN = sidn;
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.bookingService.getCompletedBookingsByVenue(this.venueId).pipe(
      switchMap(completedBookings =>
        this.bookingService.getVenueHandOvers(this.venueId).pipe(
          map(handovers => {
            const checkedIn = new Set(handovers.map(h => h.forBooking));
            return completedBookings
              .filter(b => !checkedIn.has(b.bookingId))
              .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
          })
        )
      ),
      switchMap(pending => {
        if (pending.length === 0) {
          return of([] as EnrichedBooking[]);
        }
        // for each booking, fetch lease-package & activity
        const enriched$ = pending.map(b =>
          forkJoin({
            base: of(b),
            lease: this.bookingService.getLeaseById(b.venuePackageId).pipe(
              catchError(() => of({ packageName: 'N/A', price: 0 }))
            ),
            activity: this.bookingService.getActivityById(b.venueActivityId).pipe(
              catchError(() => of({ activityName: 'N/A' }))
            )
          }).pipe(
            map(({ base, lease, activity }) => ({
              ...base,
              packageName: lease.packageName,
              price: lease.price,
              activityName: activity.activityName
            }))
          )
        );
        return forkJoin(enriched$);
      })
    ).subscribe({
      next: enrichedList => {
        this.bookings = enrichedList;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Failed to load bookings.';
        this.loading = false;
      }
    });
  }

  onCheckIn(booking: EnrichedBooking): void {
    this.bookingService.checkIn(booking.bookingCode, this.staffIDN).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(b => b.bookingId !== booking.bookingId);
      },
      error: err => {
        console.error('Check-in failed', err);
        alert('Check-in failed: ' + (err.error?.message || err.message));
      }
    });
  }
}
