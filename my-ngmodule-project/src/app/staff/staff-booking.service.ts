import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface BookingDTO {
  bookingId: number;
  bookingCode: string;
  bookingDate: string;
  startDate: string;
  endDate: string | null;
  startTime:string;
  endTime:string;
  bookingStatus: string;
  venueName:string;
  venueActivityId: number;
  venueActivityName: string;
  venueActivityPrice:number;
  venueOptionalServiceName: string;
  venueOptionalServiceId: number;
  venueOptionServicePrice: number;
  discountRate:number;
  customer: {
    customerId: number;
    customerName: string;
    phoneNumber: string;
    address: string;
    email: string;
    customerType:string;
    referenceDocumen:string;
  };  
}
export interface VenueHandOverDTO {
  handOverId: number;
  forBooking: number;    
  staffIdentification: string;
  checkInTime: string;
  checkOutTime?: string; 
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
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}
  
  getCancelledBookingsByVenue(venueId: number) {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/bookings/view/cancelled-by-venue/${venueId}`);
  }

  getUncheckedBookingsByVenue(venueId: number) {
    return this.http.get<BookingDTO[]>(`${this.baseUrl}/bookings/view/unchecked-bookings/${venueId}`);
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
  checkIn(bookingCode: string, staffIdentification: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/venue-handover/checkin`, { bookingCode, staffIdentification });
  }

 

  // Perform a check-out for a booking.
  checkOut(payload: {
    bookingCode: string;
    staffIdentification: string;
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
  getOptionalServiceById(serviceId: number): Observable<{ 
    serviceId: number; 
    serviceName: string; 
    price: number 
    description: string 
  }> {
    return this.http.get<{ 
      serviceId: number; 
      serviceName: string; 
      price: number 
      description: string 
    }>(
      `${this.baseUrl}/optional-services/serviceBy/${serviceId}`
    );
  }

  /** Fetch one activity by its ID */
  getActivityById(activityId: number): Observable<{ 
    activityId: number; 
    activityName: string; 
    price: number 
    description: string 
  }> {
    return this.http.get<{ 
      activityId: number; 
      activityName: string; 
      price: number 
      description: string 
    }>(
      `${this.baseUrl}/activities/${activityId}`
    );
  }


}
