import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Booking {
  bookingId: number;
  bookingCode: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: 'PENDING' | 'COMPLETE' | 'CANCELLED';
  venue: {
    venueId: number;
    venueName: string;
  };
  customer: {
    customerId: number;
    fullName: string;
  };
}

export interface BookedSlot {
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  // add other fields if any
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  bookings$ = this.bookingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Fetch and cache all bookings
  fetchBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/all`).pipe(
      tap((bookings) => this.bookingsSubject.next(bookings))
    );
  }

  // Return cached bookings or fetch if empty
  getBookings(): Observable<Booking[]> {
    if (this.bookingsSubject.getValue().length === 0) {
      return this.fetchBookings();
    }
    return this.bookings$;
  }

  // Manually refresh cached bookings
  refreshBookings(): void {
    this.fetchBookings().subscribe();
  }

  // Get booked slots for a venue
  // getBookedDates(venueId: number): Observable<BookedSlot[]> {
  //   return this.http.get<BookedSlot[]>(`${this.apiUrl}/venue/${venueId}/booked-slots`);
  // }
  getBookedDates(venueId: number): Observable<string[]> {
    return this.http.get<any[]>(`${this.apiUrl}/venue/${venueId}/booked-slots`);
  }

  // Create a new booking
  createBooking(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, bookingData);
  }

  // Check availability of a venue for a given date/time
  checkVenueAvailability(venueId: number, startDate: string, startTime: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-availability`, {
      params: {
        venueId: venueId.toString(),
        startDate,
        startTime
      }
    });
  }

  // Cancel a booking by ID
  cancelBooking(bookingId: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/cancel/${bookingId}`, {});
  }

  // Get booking details by booking ID
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  // Get bookings filtered by customer ID
  getBookingsByCustomer(customerId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  // Placeholder methods to be implemented
  getLeasesByVenue(venueId: number) {
    throw new Error('Method not implemented.');
  }

  getVenues() {
    throw new Error('Method not implemented.');
  }

  getPackages(venueId: any) {
    throw new Error('Method not implemented.');
  }
}
