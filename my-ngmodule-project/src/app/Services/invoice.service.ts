import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface StaffDTO {
  staffId: number;
  staffIDN: string;
  fullName: string;
  phoneNumber: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  


  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getInvoiceByBookingId(bookingId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/invoices/view/by-booking/${bookingId}`);
  }

  getStaffByAssignedVenue(venueId: number): Observable<StaffDTO[]> {
    return this.http.get<StaffDTO[]>(
      `${this.baseUrl}/staff/all/by-assigned-venue/${venueId}`
    );
  }
}