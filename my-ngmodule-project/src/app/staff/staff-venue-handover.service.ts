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
  private readonly apiBase = '/api/venue-handover';

  constructor(private http: HttpClient) {}

  checkIn(bookingCode: string, staffIdentification: string): Observable<any> {
    const params = new HttpParams()
      .set('bookingCode', bookingCode)
      .set('staffIdentification', staffIdentification);

    return this.http.post(`${this.apiBase}/checkin`, null, { params });
  }

  checkOut(payload: {
    bookingCode: string;
    staffIdentification: string;
    conditionStatus: string;
    conditionDescription: string;
  }): Observable<any> {
    return this.http.post(`${this.apiBase}/checkout`, payload);
  }

  getByStaff(staffIdentification: string): Observable<HandoverReport[]> {
    return this.http.get<HandoverReport[]>(`${this.apiBase}/staff/${staffIdentification}`);
  }
}
