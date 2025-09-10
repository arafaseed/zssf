import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface StaffDTO {
  staffId: number;
  staffIdentification: string;
  fullName: string;
  phoneNumber: string;
  role: string;
}

export interface PaymentDTO {
  paymentId: number;
  paymentDate: string;        
  amountPaid: number;
  paymentDescription?: string | null;
  controlNumberId?: number;
  zanmalipo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getInvoiceByBookingId(bookingId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/invoices/view/by-booking/${bookingId}`);
  }

  getStaffByAssignedVenue(venueId: number): Observable<StaffDTO[]> {
    return this.http.get<StaffDTO[]>(
      `${this.baseUrl}/staff/all/by-assigned-venue/${venueId}`
    );
  }

  // NEW - fetch by invoiceCode (used by scanner)
  getInvoiceByCode(code: string) {
    const url = `${this.baseUrl}/invoices/view/by-code/${encodeURIComponent(code)}`;
    return this.http.get<any>(url);
  }

  getPaymentsByControlNumber(controlNumber: string) {
  // adjust to match your service's baseUrl / http usage
  return this.http.get<PaymentDTO[]>(`${this.baseUrl}/payments/by-control-number/${encodeURIComponent(controlNumber)}`);
}


}
