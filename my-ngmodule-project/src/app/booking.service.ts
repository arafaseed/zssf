import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingFormComponent } from './booking-form/booking-form.component';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = '  http://localhost:8080/api/bookings';  // Adjust API URL as needed

  constructor(private http: HttpClient) { }

  // createBooking(booking: BookingFormComponent): Observable<BookingFormComponent> {
  //   return this.http.post<BookingFormComponent>(`${this.apiUrl}/create`, booking); // Fixed syntax here
  // }

  // Create a new booking
  createBooking(bookingData: any): Observable<any> {
const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
   return this.http.post<any>(`${this.apiUrl}/create`, bookingData,{ headers });

}

  // Get all bookings
  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  // Get booking by ID
  getBookingById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Update booking
  updateBooking(id: number, bookingData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, bookingData);
  }

  // Delete booking
  deleteBooking(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`);
  }

  // Get bookings by venue
  getBookingsByVenue(venueId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/venue/${venueId}`);
  }

  // Check venue availability
  checkVenueAvailability(venueId: number, startDate: string, startTime: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-availability`, {
      params: { venueId: venueId.toString(), startDate, startTime },
    });
  }
}
