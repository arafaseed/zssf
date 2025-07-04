import { Component, OnInit } from '@angular/core';
import { StaffBookingService, BookingDTO, VenueHandOverDTO } from '../../staff-booking.service';
import { switchMap, map, forkJoin, catchError, of } from 'rxjs';


interface DisplayBooking {
  booking: BookingDTO;
  packageName: string;
  price: number;
  activityName: string;
}

@Component({
  selector: 'app-check-in-list',
  standalone: false,
  templateUrl: './check-in-list.component.html',
  styleUrls: ['./check-in-list.component.css']
})
export class CheckInListComponent implements OnInit {
  // bookings: BookingDTO[] = [];
  bookings: DisplayBooking[] = [];
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

    this.bookingService.getCompletedBookingsByVenue(this.venueId).pipe(
      switchMap(bookings =>
        this.bookingService.getVenueHandOvers(this.venueId).pipe(
          map(handovers => {
            const checkedInSet = new Set(handovers.map(h => h.forBooking));
            return bookings.filter(b => !checkedInSet.has(b.bookingId));
          })
        )
      ),
      switchMap(pending => {
        return forkJoin(pending.map(b =>
          forkJoin({
            pkg: this.bookingService.getPackageById(b.venuePackageId).pipe(catchError(() => of({ packageName: '—', price: 0 }))),
            act: this.bookingService.getActivityById(b.venueActivityId).pipe(catchError(() => of({ activityName: '—' })))
          }).pipe(
            map(({ pkg, act }) => ({
              booking: b,
              packageName: pkg.packageName,
              price: pkg.price,
              activityName: act.activityName
            }))
          )
        ));
      })
    ).subscribe({
      next: list => {
        this.bookings = list.sort((a, b) =>
          new Date(b.booking.bookingDate).getTime() - new Date(a.booking.bookingDate).getTime()
        );
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Failed to load bookings or related data.';
        this.loading = false;
      }
    });
  }

  onCheckIn(item: DisplayBooking): void {
    this.bookingService.checkIn(item.booking.bookingCode, this.staffIDN).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(b => b.booking.bookingId !== item.booking.bookingId);
      },
      error: err => {
        console.error(err);
        alert('Check-in failed: ' + (err.error?.message || err.message));
      }
    });
  }
}
