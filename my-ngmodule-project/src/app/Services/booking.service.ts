// booking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  getVenues() {
    throw new Error('Method not implemented.');
  }
  getPackages() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  getBookedDates(venueId: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/venue/${venueId}/booked-dates`
    );
  }

  createBooking(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, bookingData);
  }
}