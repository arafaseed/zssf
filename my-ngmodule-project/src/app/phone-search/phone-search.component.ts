import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { environment } from '../../environments/environment';


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

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  onSubmit() {
    this.searching = true;
    this.noResults = false;
    this.bookings = [];

    this.http
      .get<any[]>(`${environment.apiUrl}/api/bookings/by-customer-phone?phone=${this.phoneNumber}`)
      .subscribe({
        next: (data) => {
          this.bookings = data.filter(b => b.bookingStatus.toLowerCase() !== 'cancelled');
          this.noResults = this.bookings.length === 0;
          this.searching = false;
          if (this.noResults) {
            this.snackBar.open('No bookings found.', 'Close', { duration: 3000, panelClass: ['snackbar-info'] });
          }
        },
        error: (err) => {
          console.error('Error fetching bookings:', err);
          this.noResults = true;
          this.searching = false;
          this.snackBar.open('Failed to fetch bookings. Please try again.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
        },
      });
  }

  cancelBooking(bookingId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Cancellation',
        message: 'Are you sure you want to cancel this booking?',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.http.post<any>(`${environment.apiUrl}/api/bookings/cancel/${bookingId}`, {})
          .subscribe({
            next: () => {
              this.snackBar.open('Booking successfully cancelled!', 'Close', { duration: 3000, panelClass: ['snackbar-success'] });
              this.onSubmit();
            },
            error: (err) => {
              console.error('Error cancelling booking:', err);
              this.snackBar.open('Failed to cancel booking. Please try again.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
            },
          });
      }
    });
  }

  validateNumberInput(event: KeyboardEvent) {
    const allowed = /[0-9]/;
    if (!allowed.test(event.key)) {
      event.preventDefault();
    }
  }
}