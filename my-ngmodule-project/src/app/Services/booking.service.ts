import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Booking {
  bookingId: number;
  bookingCode: string;
  startDate: string;
  startTime: string;
  endDate: string | null;
  endTime: string;
  status: 'PENDING' | 'COMPLETE' | 'CANCELLED';
  venueId: number;
  venueName?: string; // ADD THIS
  activityName?: string; // ADD THIS (if you have activityId)
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
  checkDateAvailability: any;

  constructor(private http: HttpClient) {}

  // Fetch and cache all bookings
  fetchBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/all`).pipe(
      tap((bookings) => this.bookingsSubject.next(bookings))
    );
  }

  // booking.service.ts
getVenueNameById(venueId: number): Observable<string> {
  return this.http.get<any>(`http://localhost:8080/api/venues/view/${venueId}`)
    .pipe(map((venue: { name: any; }) => venue.name));
}

getActivityNameById(activityId: number): Observable<string> {
  return this.http.get<any>(`http://localhost:8080/api/activities/${activityId}`)
    .pipe(map((activity: { name: any; }) => activity.name));
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

   // A method to get booked slots
  getBookedSlots(venueId: number): Observable<Array<{ date: string; startTime: string; endTime: string }>> {
  return this.http.get<Array<{ date: string; startTime: string; endTime: string }>>(
    `${this.apiUrl}/venue/${venueId}/booked-slots`
  );
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

}
