import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import {
  StaffBookingService,
  BookingDTO,
  VenueHandOverDTO
} from '../../staff-booking.service';

interface EnrichedBooking extends BookingDTO {
  serviceName: string;
  optionalServicePrice: number;
  activityName: string;
  activityPrice: number;
}

@Component({
  selector: 'app-check-in-list',
  standalone: false,
  templateUrl: './check-in-list.component.html',
  styleUrls: ['./check-in-list.component.css']
})
export class CheckInListComponent implements OnInit {
  bookings: EnrichedBooking[] = [];
  loading = true;
  errorMessage: string | null = null;

  private venueId!: number;
  private staffIdentification!: string;

  constructor(private bookingService: StaffBookingService) {}

  ngOnInit(): void {
    const vid = sessionStorage.getItem('activeVenueId');
    const sidn = sessionStorage.getItem('auth-username');

    if (!vid || !sidn) {
      this.errorMessage = 
        'Venue or Staff Identification not found in session. Please log in again.';
      this.loading = false;
      return;
    }

    this.venueId = +vid;
    this.staffIdentification = sidn;
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
            // 1) only those not yet checked in
            // 2) exclude CANCELLED
            return completedBookings
              .filter(b => 
                !checkedIn.has(b.bookingId) && b.bookingStatus !== 'CANCELLED'
              )
              .sort((a, b) => 
                new Date(b.bookingDate).getTime() 
                - new Date(a.bookingDate).getTime()
              );
          })
        )
      ),
      switchMap(pending => {
        if (pending.length === 0) {
          return of([] as EnrichedBooking[]);
        }
        // 3) enrich each
        const enriched$ = pending.map(b =>
          forkJoin({
            base: of(b),
            optservice: this.bookingService.getOptionalServiceById(b.venueOptionalServiceId).pipe(
              catchError(() => of({ serviceName: 'N/A', price: 0 }))
            ),
            activity: this.bookingService.getActivityById(b.venueActivityId).
            pipe(
              catchError(() => of({ activityName: 'N/A',price: 0 }))
            )
          }).pipe(
            map(({ base, optservice, activity }) => ({
              ...base,
              serviceName: optservice.serviceName,
              optionalServicePrice: optservice.price,
              activityName: activity.activityName,
              activityPrice: activity.price
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

  /** 
   * A booking is “check-in-able” only if its status is not PENDING
   * and its startDate matches today. 
   */
  isCheckInEnabled(b: EnrichedBooking): boolean {
  const status = (b?.bookingStatus ?? '').toString().toUpperCase();
  // disable check-in for PENDING, EXPIRED and IN_PROGRESS
  return !['PENDING', 'EXPIRED', 'IN_PROGRESS'].includes(status);
}


  onCheckIn(booking: EnrichedBooking): void {
    if (!this.isCheckInEnabled(booking)) {
      if (booking.bookingStatus === 'PENDING' || booking.bookingStatus === 'IN_PROGRESS') {
        alert('This booking is still pending payments,tell customer to complete payment first.');
      } else if (booking.bookingStatus === 'EXPIRED') {
        alert('This booking is Expired , cannot be checked in.');
      }else {
        alert('You can only check-in this booking on the events start day.');
      }
      return;
    }

    this.bookingService.checkIn(booking.bookingCode, this.staffIdentification)
      .subscribe({
        next: () => {
          // remove from list
          this.bookings = this.bookings
            .filter(b => b.bookingId !== booking.bookingId);
        },
        error: err => {
          console.error('Check-in failed', err);
          alert('Check-in failed: ' + (err.error?.message || err.message));
        }
      });
  }
}
