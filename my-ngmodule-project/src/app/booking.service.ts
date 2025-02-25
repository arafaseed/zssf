import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  // Method to register a new booking
  registerBooking(bookingData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, bookingData).pipe(
      catchError(error => {
        console.error('Error booking:', error);
        return throwError(() => new Error('Booking failed. Try again.'));
      })
    );
  }
  
}
