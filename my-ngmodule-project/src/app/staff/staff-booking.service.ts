import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BookingDTO {
  bookingId: number;
  bookingCode: string;
  bookingDate: string;   // e.g. "2025-05-22"
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: string;        // e.g. "COMPLETE"
  venueName: string;     // assume backend populates this
  packageName: string;
  price: number;
  customerName: string;
  customerPhone: string;
  // …any other fields you need…
}

export interface VenueHandOverDTO {
  handOverId: number;
  forBooking: number;    // the bookingId that was checked in
  staffIDN: string;
  checkInTime: string;
  checkOutTime?: string; // might be undefined/null if not yet checked out
  conditionStatus?: string;
  conditionDescription?: string;
  // ...other fields if any…
}


@Injectable({
  providedIn: 'root'
})
export class StaffBookingService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // 1) Get completed bookings for a venue
  getCompletedBookingsByVenue(venueId: number): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/bookings/venue/completed/${venueId}`);
  }

  // 2) Get all handovers (checked-in) for a venue
  getVenueHandOvers(venueId: number): Observable<VenueHandOverDTO[]> {
    const params = new HttpParams().set('venueId', venueId.toString());
    return this.http.get<VenueHandOverDTO[]>(`${this.baseUrl}/venue-handover/venue`, { params });
  }

  // 3) Check-in a booking
  checkIn(bookingCode: string, staffIDN: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/venue-handover/checkin`, { bookingCode, staffIDN });
  }

  /** 1) Fetch all completed bookings for this venue.
   *   Endpoint: GET /api/bookings/venue/completed/{venueId}
   */
  // getCompletedBookingsByVenue(venueId: number): Observable<BookingDTO[]> {
  //   return this.http.get<BookingDTO[]>(
  //     `${this.baseUrl}/bookings/venue/completed/${venueId}`
  //   );
  // }

  // /** 2) Fetch all handover records (checked-in/checked-out) for a venue.
  //  *   Endpoint: GET /api/venue-handover/venue?venueId={venueId}
  //  */
  // getVenueHandOvers(venueId: number): Observable<VenueHandOverDTO[]> {
  //   const params = new HttpParams().set('venueId', venueId.toString());
  //   return this.http.get<VenueHandOverDTO[]>(
  //     `${this.baseUrl}/venue-handover/venue`, 
  //     { params }
  //   );
  // }

  /** 3) Perform a check-out for a booking.
   *   Endpoint: POST /api/venue-handover/checkout
   *   Payload: { bookingCode, staffIDN, conditionStatus, conditionDescription }
   */
  checkOut(payload: {
    bookingCode: string;
    staffIDN: string;
    conditionStatus: string;
    conditionDescription: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/venue-handover/checkout`, payload);
  }

}
