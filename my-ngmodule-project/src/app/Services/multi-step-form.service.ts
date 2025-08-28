import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class MultiStepFormService {
  [x: string]: any;


  private venueApiUrl = '${environment.apiUrl}/api/venues/view/all';
  private packageApiUrl = '${environment.apiUrl}/api/lease-packages';
  private activityApiUrl = '${environment.apiUrl}/api/activities';
  private bookingApiUrl = '${environment.apiUrl}/api/bookings/create';

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
  return this.http.get<any>(`${environment.apiUrl}/api/invoices/view/by-booking?bookingId=${bookingId}`);
}

}