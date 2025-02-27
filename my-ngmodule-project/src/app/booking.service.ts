import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BookingFormComponent } from './booking-form/booking-form.component';

import { catchError, Observable, throwError } from 'rxjs';
=======
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
>>>>>>> a25b6339b2dcd4d7d13997d0265b6ca46d07b3cf

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

<<<<<<< HEAD
  // createBooking(booking: BookingFormComponent): Observable<BookingFormComponent> {
  //   return this.http.post<BookingFormComponent>(`${this.apiUrl}/create`, booking); // Fixed syntax here
  // }

  // Create a new booking
=======
>>>>>>> a25b6339b2dcd4d7d13997d0265b6ca46d07b3cf
  createBooking(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, bookingData);
  }

<<<<<<< HEAD
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
  // Method to register a new booking
  // registerBooking(bookingData: any): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/add`, bookingData).pipe(
  //     catchError(error => {
  //       console.error('Error booking:', error);
  //       return throwError(() => new Error('Booking failed. Try again.'));
  //     })
  //   );
  // }
  
=======
  getVenues(): Observable<any> {
    return this.http.get('http://localhost:8080/api/venues/all');
  }
>>>>>>> a25b6339b2dcd4d7d13997d0265b6ca46d07b3cf
}
}
