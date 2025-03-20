import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  // Existing method to get booked dates for a venue
  getBookedDates(venueId: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.apiUrl}/venue/${venueId}/booked-dates`
    );
  }

  // Existing method to create a booking
  createBooking(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, bookingData);
  }

  // New method to check the availability of a venue
  checkVenueAvailability(venueId: number, startDate: string, startTime: string): Observable<boolean> {
    // Format the date and time correctly for the request
    return this.http.get<boolean>(`${this.apiUrl}/check-availability`, {
      params: {
        venueId: venueId.toString(),
        startDate: startDate,
        startTime: startTime
      }
    });
  }
}
