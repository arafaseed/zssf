import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-phone-search',
  templateUrl: './phone-search.component.html',
  styleUrls: ['./phone-search.component.css'],
  standalone: false
})
export class PhoneSearchComponent {
  phoneNumber: string = '';
  bookings: any[] = [];
  noResults = false;
  searching = false;

  constructor(private http: HttpClient) {}

  onSubmit() {
    if (!this.phoneNumber.trim()) return;

    this.searching = true;
    this.noResults = false;
    this.bookings = [];

    this.http.get<any[]>(`http://localhost:8080/api/bookings/view/by-phone/${this.phoneNumber}`)
      .subscribe({
        next: (data) => {
          this.bookings = data;
          this.noResults = data.length === 0;
          this.searching = false;
        },
        error: (err) => {
          console.error('Error fetching bookings:', err);
          this.noResults = true;
          this.searching = false;
        }
      });
  }

  cancelBooking(bookingId: number) {
    const confirmCancel = confirm('Are you sure you want to cancel this booking?');
    if (!confirmCancel) return;

    this.http.put<any>(`http://localhost:8080/api/bookings/cancel/${bookingId}`, {})
      .subscribe({
        next: () => {
          // Refresh the search result after successful cancellation
          this.onSubmit();
        },
        error: (err) => {
          console.error('Error cancelling booking:', err);
          alert('Failed to cancel booking. Please try again.');
        }
      });
  }
}
