import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type BookingStatus = 'EXPIRED'|'IN_PROGRESS'|'PENDING' | 'COMPLETE' | 'CANCELLED';
export type CustomerType = 'INDIVIDUAL' | 'ORGANIZATION';


export interface Customer {
  customerId: number;
  customerName: string;
  phoneNumber?: string;
  address?: string;
  email?: string;
  customerType: CustomerType;
  referenceDocument?: string[]; // links to documents (pdf)
  bookingIds?: number[] | null;
}

export interface Booking {
  bookingId: number;
  bookingCode: string;
  bookingDate: string;            // added
  startDate: string;
  startTime: string;
  endDate: string | null;
  endTime: string;
  bookingStatus: BookingStatus;
  venueId: number;
  venueName?: string;
  venueActivityId?: number;
  venueActivityName?: string;    // activity field (added)
  customer: Customer;
  invoiceId?: number;
  discountRate?: number | null;
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

  private apiUrl = `${environment.apiUrl}/api/bookings`;

  private bookingsSubject = new BehaviorSubject<Booking[]>([]);

  bookings$ = this.bookingsSubject.asObservable();

  checkDateAvailability: any;

  constructor(private http: HttpClient) {}

  // Fetch and cache all bookings
  fetchBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/view-all`).pipe(
      tap((bookings) => this.bookingsSubject.next(bookings))
    );
  }

  // Return cached bookings or fetch if empty
  getBookings() {
    if (this.bookingsSubject.getValue().length === 0) {
      return this.fetchBookings();
    }
    // return an observable of the current value so subscribe works consistently
    return this.bookings$;
  }

  // booking.service.ts
getVenueNameById(venueId: number): Observable<string> {
  return this.http
    .get<any>(`${environment.apiUrl}/api/venues/view/${venueId}`)
    .pipe(
      // tap((venue) => console.log('API response for venueId', venueId, venue)),
      map((venue: any) => venue.venueName)
 // <- Check if property is really 'name'
    );
}


getActivityNameById(activityId: number): Observable<string> {
  return this.http.get<any>(`${environment.apiUrl}/api/activities/${activityId}`)
    .pipe(map((activity: { name: any; }) => activity.name));
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

  // GET optional services for a venue
  getOptionalServicesForVenue(venueId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/optional-services/venue/${venueId}`);
  }

  placeReservation(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/place-reservation`, formData);
  }

}
