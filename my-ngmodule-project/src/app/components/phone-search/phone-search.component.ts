import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-phone-search',
  templateUrl: './phone-search.component.html',
  standalone: false,
  styleUrls: ['./phone-search.component.css'],
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
    private translate: TranslateService
  ) {}

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
      .get<any[]>(`${environment.apiUrl}/api/bookings/by-customer-phone?phone=${this.phoneNumber}`)
      .subscribe({
        next: (data) => {
          const filtered = data.filter(b => b.bookingStatus && b.bookingStatus.toLowerCase() !== 'cancelled');
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
    const safeTime = (d: any): number => {
      if (!d && d !== 0) return -8640000000000000;
      const t = Date.parse(d);
      return isNaN(t) ? -8640000000000000 : t;
    };
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
        this.http.post<any>(`${environment.apiUrl}/api/bookings/cancel/${bookingId}`, {})
          .subscribe({
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
    const allowed = /[0-9]/;
    if (!allowed.test(event.key)) {
      event.preventDefault();
    }
  }
}
