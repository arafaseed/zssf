import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface BookingDTO {
  bookingId: number;
  bookingCode: string;
  bookingDate: string;
  startDate: string;
  endDate: string | null;
  venueName: string;
  packageName: string;
  price: number;
  status: string;
  customer: {
    customerId: number;
    fullName: string;
    phoneNumber: string;
    address: string;
    email: string;
  };
  venuePackageId: number;
  venueActivityId: number;
  // …etc…
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

export interface Report {
  handOverId: number;
  forBookingId: number;
  venueId: number;
  venueName: string;
  customerFullName: string;
  customerPhone: string;
  packageName: string;
  activityName: string;
  price: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  conditionStatus: string | null;
  conditionDescription: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class StaffBookingService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}
  
  getCancelledBookingsByVenue(venueId: number) {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/bookings/view/cancelled-by-venue/${venueId}`);
 }


  //  Get completed bookings for a venue
  getCompletedBookingsByVenue(venueId: number): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/bookings/venue/pending-checkin/${venueId}`);
  }

  // Get all handovers (checked-in) for a venue
  getVenueHandOvers(venueId: number): Observable<VenueHandOverDTO[]> {
    const params = new HttpParams().set('venueId', venueId.toString());
    return this.http.get<VenueHandOverDTO[]>(`${this.baseUrl}/venue-handover/venue`, { params });
  }

  //Get all bookings to handed over but pending on check-out
  getPendingCheckOuts(venueId: number): Observable<BookingDTO[]> {
    return this.http.get<BookingDTO[]>(
      `${this.baseUrl}/bookings/view/pending-checkout/${venueId}`
    );
  }

  // Check-in a booking
  checkIn(bookingCode: string, staffIDN: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/venue-handover/checkin`, { bookingCode, staffIDN });
  }

 

  // Perform a check-out for a booking.
  checkOut(payload: {
    bookingCode: string;
    staffIDN: string;
    conditionStatus: string;
    conditionDescription: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/venue-handover/checkout`, payload);
  }

  //Getting all reports on handovers for a venue
  getReportsByVenue(venueId: number): Observable<Report[]> {
    return this.http.get<Report[]>(
      `${this.baseUrl}/venue-handover/venue-detailed/${venueId}`
    );
  }

  /** Fetch one lease package by its ID */
  getLeaseById(leaseId: number): Observable<{ leaseId: number; packageName: string; price: number }> {
    return this.http.get<{ leaseId: number; packageName: string; price: number }>(
      `${this.baseUrl}/lease-packages/leaseBy/${leaseId}`
    );
  }

  /** Fetch one activity by its ID */
  getActivityById(activityId: number): Observable<{ activityId: number; activityName: string; activityDescription: string }> {
    return this.http.get<{ activityId: number; activityName: string; activityDescription: string }>(
      `${this.baseUrl}/activities/${activityId}`
    );
  }


}
