import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class MultiStepFormService {
  [x: string]: any;


  private venueApiUrl = 'http://localhost:8080/api/venues/view/all';
  private packageApiUrl = 'http://localhost:8080/api/lease-packages';
  private activityApiUrl = 'http://localhost:8080/api/activities';
  private bookingApiUrl = 'http://localhost:8080/api/bookings/create';

  constructor(private http: HttpClient) {}

  createBooking(bookingData: any): Observable<any> {
    return this.http.post<any>(this.bookingApiUrl, bookingData);
  }

  getVenues(): Observable<any[]> {
    return this.http.get<any[]>(this.venueApiUrl);
  }

  getPackages(): Observable<any[]> {
    return this.http.get<any[]>(this.packageApiUrl);
  }

  getActivities(): Observable<any[]> {
    return this.http.get<any[]>(this.packageApiUrl);
  }

  getLeasesByVenue(venueId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.packageApiUrl}/venue/${venueId}`);
  }

  getActivitiesByVenue(venueId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.activityApiUrl}/venue/${venueId}`);
  }

  // multi-step-form.service.ts
getInvoiceByBookingId(bookingId: number): Observable<any> {
  return this.http.get<any>(`http://localhost:8080/api/invoices/view/by-booking?bookingId=${bookingId}`);
}

}