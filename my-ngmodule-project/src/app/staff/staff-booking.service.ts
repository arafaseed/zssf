import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Booking {
  bookingCode: string;
  venueName: string;
  packageName: string;
  price: number;
  customerName: string;
  customerPhone: string;
  cancelled: boolean;
  checkedIn: boolean;
  checkedOut: boolean;
  endDateTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class StaffBookingService {
  private readonly apiBase = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  getByVenue(venueId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiBase}/venue/${venueId}`);
  }
}

