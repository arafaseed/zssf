import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HandoverReport {
  bookingCode: string;
  checkInTime: string;
  checkOutTime: string;
  conditionStatus: string;
  conditionDescription: string;
}

@Injectable({
  providedIn: 'root'
})
export class VenueHandoverService {
  private readonly apiBase = 'http://localhost:8080/api/venue-handover';

  constructor(private http: HttpClient) {}

  checkIn(bookingCode: string, staffIDN: string): Observable<any> {
    const params = new HttpParams()
      .set('bookingCode', bookingCode)
      .set('staffIDN', staffIDN);

    return this.http.post(`${this.apiBase}/checkin`, null, { params });
  }

  checkOut(payload: {
    bookingCode: string;
    staffIDN: string;
    conditionStatus: string;
    conditionDescription: string;
  }): Observable<any> {
    return this.http.post(`${this.apiBase}/checkout`, payload);
  }

  getByStaff(staffIDN: string): Observable<HandoverReport[]> {
    return this.http.get<HandoverReport[]>(`${this.apiBase}/staff/${staffIDN}`);
  }
}
