import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { PostponeDialogComponent } from '../postpone-dialog/postpone-dialog.component';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-phone-search',
  templateUrl: './phone-search.component.html',
  styleUrls: ['./phone-search.component.css'],
  standalone: false,
})
export class PhoneSearchComponent {
  phoneNumber: string = '';
  bookings: any[] = [];
  noResults = false;
  searching = false;
  today = new Date();

  // POSTPONE / AVAILABILITY FIELDS
  currentBooking: any = null;
  startDate!: Date;
  endDate!: Date;
  startTime: string = '';
  endTime: string = '';
  formError: string = '';
  minDate = new Date();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {}

  // ----------------- SEARCH BOOKINGS -----------------
  onSubmit() {
    if (!this.phoneNumber) {
      this.snackBar.open(
        this.translate.instant('phoneSearch.errors.required'),
        this.translate.instant('Close'),
        { duration: 3000 }
      );
      return;
    }

    this.searching = true;
    this.noResults = false;
    this.bookings = [];

    this.http
      .get<any[]>(`${environment.apiUrl}/api/bookings/by-phone/${this.phoneNumber.trim()}`)
      .subscribe({
        next: (data) => {
          const filtered = data.filter(
            (b) => b.bookingStatus && b.bookingStatus.toLowerCase() !== 'cancelled'
          );

          // Ensure extendCount is defined
          filtered.forEach(b => {
            b.extendCount = b.extendCount ?? 0;
          });

          this.bookings = this.sortByBookingDateDesc(filtered);
          this.noResults = this.bookings.length === 0;
          this.searching = false;

          if (this.noResults) {
            this.snackBar.open(
              this.translate.instant('phoneSearch.noResults'),
              this.translate.instant('Close'),
              { duration: 3000 }
            );
          }
        },
        error: (err) => {
          console.error('Error fetching bookings:', err);
          this.noResults = true;
          this.searching = false;
          this.snackBar.open(
            this.translate.instant('phoneSearch.fetchError'),
            this.translate.instant('Close'),
            { duration: 3000 }
          );
        },
      });
  }

  private sortByBookingDateDesc(bookings: any[]): any[] {
    const safeTime = (d: any) => (d ? Date.parse(d) : -8640000000000000);
    return bookings.slice().sort((a, b) => safeTime(b?.bookingDate) - safeTime(a?.bookingDate));
  }

  cancelBooking(bookingId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('phoneSearch.confirmCancelTitle'),
        message: this.translate.instant('phoneSearch.confirmCancelMsg'),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.http.post<any>(`${environment.apiUrl}/api/bookings/cancel/${bookingId}`, {}).subscribe({
          next: () => {
            this.snackBar.open(
              this.translate.instant('phoneSearch.cancelSuccess'),
              this.translate.instant('Close'),
              { duration: 3000 }
            );
            this.onSubmit();
          },
          error: (err) => {
            console.error('Error cancelling booking:', err);
            this.snackBar.open(
              this.translate.instant('phoneSearch.cancelError'),
              this.translate.instant('Close'),
              { duration: 3000 }
            );
          },
        });
      }
    });
  }

  validateNumberInput(event: KeyboardEvent) {
    if (!/[0-9]/.test(event.key)) event.preventDefault();
  }

  // ----------------- POSTPONE / AVAILABILITY -----------------
  setCurrentBooking(booking: any) {
    if (this.currentBooking?.bookingId === booking.bookingId) {
      this.currentBooking = null;
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/api/bookings/${booking.bookingId}`).subscribe({
      next: (latest) => {
        this.currentBooking = latest;

        if (new Date(latest.endDate) < new Date()) {
          this.snackBar.open(
            this.translate.instant('phoneSearch.cannotPostponePast'),
            this.translate.instant('Close'),
            { duration: 4000 }
          );
          this.currentBooking = null;
          return;
        }

        if ((latest.extendCount ?? 0) >= 2) {
          this.snackBar.open(
            this.translate.instant('phoneSearch.limitReached'),
            this.translate.instant('Close'),
            { duration: 4000 }
          );
          this.currentBooking = null;
          return;
        }

        this.startDate = new Date(latest.startDate);
        this.endDate = new Date(latest.endDate);
        this.startTime = this.formatBookingTime(latest.startTime);
        this.endTime = this.formatBookingTime(latest.endTime);
      },
      error: (err) => {
        console.error('Error fetching booking details:', err);
        this.snackBar.open(
          'Error fetching latest booking details',
          this.translate.instant('Close'),
          { duration: 4000 }
        );
      }
    });
  }

  formatBookingTime(time: any): string {
    if (!time) return '';
    if (typeof time === 'string') return time.includes('T') ? time.split('T')[1].substring(0, 5) : time.substring(0, 5);
    if (time instanceof Date) return `${time.getHours().toString().padStart(2,'0')}:${time.getMinutes().toString().padStart(2,'0')}`;
    return '';
  }

  checkVenueAvailabilityForBooking() {
    if (!this.currentBooking || !this.startDate || !this.endDate || !this.startTime || !this.endTime) {
      this.formError = this.translate.instant('phoneSearch.fillAllFields') || 'Please fill all fields';
      return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const startDateOnly = new Date(this.startDate); startDateOnly.setHours(0,0,0,0);
    const endDateOnly = new Date(this.endDate); endDateOnly.setHours(0,0,0,0);

    if (startDateOnly <= today || endDateOnly <= today) {
      this.snackBar.open(
        this.translate.instant('phoneSearch.futureDatesOnly') || 'You can only choose future dates.',
        this.translate.instant('Close'),
        { duration: 4000 }
      );
      return;
    }

    if (this.startDate > this.endDate) {
      this.snackBar.open(
        this.translate.instant('phoneSearch.startAfterEnd') || 'Start date cannot be after end date.',
        this.translate.instant('Close'),
        { duration: 4000 }
      );
      return;
    }

    const originalDays = Math.ceil((new Date(this.currentBooking.endDate).getTime() - new Date(this.currentBooking.startDate).getTime())/(1000*60*60*24)) + 1;
    const selectedDays = Math.ceil((this.endDate.getTime() - this.startDate.getTime())/(1000*60*60*24)) + 1;
    if (selectedDays > originalDays) {
      this.snackBar.open(
        this.translate.instant('phoneSearch.onlyOriginalBookingDays') || `You can only postpone for up to ${originalDays} day(s).`,
        this.translate.instant('Close'),
        { duration: 4000 }
      );
      return;
    }

    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    const startDateTime = new Date(this.startDate); startDateTime.setHours(startHour,startMin,0,0);
    const endDateTime = new Date(this.endDate); endDateTime.setHours(endHour,endMin,0,0);

    if (startDateTime >= endDateTime) {
      this.snackBar.open(
        this.translate.instant('phoneSearch.startTimeAfterEndTime') || 'Start time must be before end time.',
        this.translate.instant('Close'),
        { duration: 4000 }
      );
      return;
    }

    const checkUrl = `${environment.apiUrl}/api/bookings/venue/${this.currentBooking.venueId}/availability`;
    const body = {
      startDate: this.formatDate(this.startDate),
      endDate: this.formatDate(this.endDate),
      startTime: this.startTime,
      endTime: this.endTime
    };

    this.snackBar.open(
      this.translate.instant('phoneSearch.checkingAvailability') || 'Checking venue availability...',
      '',
      { duration: 1500 }
    );

    this.http.post<any[]>(checkUrl, body).subscribe({
      next: (response) => {
        const notAvailable = response.some(day => day.flag !== 'AVAILABLE_FOR_BOOKING');
        if (notAvailable) {
          this.snackBar.open(
            this.translate.instant('phoneSearch.venueNotAvailable') || 'Venue not available.',
            this.translate.instant('Close'),
            { duration: 4000 }
          );
        } else {
          const dialogRef = this.dialog.open(PostponeDialogComponent, {
            width: '400px',
            data: { booking: this.currentBooking, startDate: this.startDate, endDate: this.endDate, startTime: this.startTime, endTime: this.endTime }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.extendBooking();
            }
          });

          this.snackBar.open(
            this.translate.instant('phoneSearch.venueAvailable') || 'Venue available for postpone.',
            this.translate.instant('Close'),
            { duration: 3000 }
          );
        }
      },
      error: (err) => {
        console.error('Error checking venue availability:', err);
        this.snackBar.open(
          this.translate.instant('phoneSearch.checkError') || 'Error checking venue availability.',
          this.translate.instant('Close'),
          { duration: 3000 }
        );
      }
    });
  }

private extendBooking() {
  if (!this.currentBooking) {
    return; // Safety check
  }

  this.http.put<any>(
    `${environment.apiUrl}/api/bookings/extend/${this.currentBooking.bookingId}`,
    {
      startDate: this.formatDate(this.startDate),
      endDate: this.formatDate(this.endDate),
      startTime: this.startTime,
      endTime: this.endTime
    }
  ).subscribe({
    next: (response) => {
      this.snackBar.open(
        this.translate.instant('phoneSearch.postponeSuccess') || 'Booking extended successfully!',
        this.translate.instant('Close'),
        { duration: 3000 }
      );

      // Update current booking and main list from backend response
      this.currentBooking = { ...this.currentBooking, ...response };
      const index = this.bookings.findIndex(b => b.bookingId === this.currentBooking.bookingId);
      if (index !== -1) this.bookings[index] = this.currentBooking;

      this.currentBooking = null;
    },
    error: (err) => {
      // Safely get error message as string
      const errorMessage: string = typeof err.error === 'string' 
        ? err.error 
        : err.error?.message || '';

      if (err.status === 400 && errorMessage.includes('two times')) {
        if (this.currentBooking) {
          this.currentBooking.extendCount = 2;
          const index = this.bookings.findIndex(b => b.bookingId === this.currentBooking.bookingId);
          if (index !== -1) this.bookings[index].extendCount = 2;
          this.currentBooking = null;
        }
      }

      const displayMsg = errorMessage.includes('two times')
        ? this.translate.instant('phoneSearch.limitReached') || 'You cannot extend more than twice.'
        : this.translate.instant('phoneSearch.postponeError') || 'Error extending booking.';

      this.snackBar.open(displayMsg, this.translate.instant('Close'), { duration: 4000 });
    }
  });
}


  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  isDatePassed(date: any): boolean {
    const now = new Date();
    const checkDate = new Date(date);
    return checkDate < now;
  }
}
