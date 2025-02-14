import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = 'https://your-api-endpoint.com/api'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  // Method to get the list of venues
  getVenues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/venues`);
  }

  // Method to register a new booking
  registerBooking(bookingData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookings`, bookingData);
  }
}
