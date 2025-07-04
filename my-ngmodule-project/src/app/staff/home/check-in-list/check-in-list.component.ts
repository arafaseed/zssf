import { Component, OnInit } from '@angular/core';
import { StaffBookingService, BookingDTO, VenueHandOverDTO } from '../../staff-booking.service';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-check-in-list',
  standalone: false,
  templateUrl: './check-in-list.component.html',
  styleUrls: ['./check-in-list.component.css']
})
export class CheckInListComponent implements OnInit {
  bookings: Array<BookingDTO & { packageName?: string; activityName?: string }> = [];
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
      switchMap(completed => this.bookingService.getVenueHandOvers(this.venueId).pipe(
        switchMap(handovers => {
          const checkedIn = new Set(handovers.map(h => h.forBooking));
          const pending = completed
            .filter(b => !checkedIn.has(b.bookingId))
            .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
          // now enrich each pending booking
          const enriched$ = pending.map(b => {
            // fetch package and activity in parallel
            return forkJoin({
              pkg: this.bookingService.getLeaseById(b.venuePackageId).pipe(catchError(() => of({ packageName: '—', price: 0 }))),
              act: this.bookingService.getActivityById(b.venueActivityId).pipe(catchError(() => of({ activityName: '—' })))
            }).pipe(
              switchMap(({ pkg, act }) => {
                return of({
                  ...b,
                  packageName: pkg.packageName,
                  price: pkg.price,
                  activityName: act.activityName
                });
              })
            );
          });
          // wait for *all* enriched bookings
          return forkJoin(enriched$);
        })
      ))
    ).subscribe({
      next: enrichedList => {
        this.bookings = enrichedList;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Failed to load bookings';
        this.loading = false;
      }
    });
  }

  onCheckIn(booking: BookingDTO): void {
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
