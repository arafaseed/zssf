import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings'; // Adjust the URL as needed

  constructor(private http: HttpClient) {}

  // Create a new booking
  createBooking(booking: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/create`, booking, { headers });
  }

  // Get all bookings
  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  // Get a booking by ID
  getBookingById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Update an existing booking
  updateBooking(id: number, booking: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, booking);
  }

  // Delete a booking
  deleteBooking(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete/${id}`);
  }

  // Get bookings by status
  getBookingsByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status/${status}`);
  }

  // Get bookings for a specific venue
  getBookingsByVenue(venueId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/venue/${venueId}`);
  }

  // Check venue availability
  checkVenueAvailability(venueId: number, startDate: string, startTime: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-availability?venueId=${venueId}&startDate=${startDate}&startTime=${startTime}`);
  }
}