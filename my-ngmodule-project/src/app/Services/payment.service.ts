import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Payment {
  paymentId: number;
  paymentDate: string;
  amountPaid: number;
  paymentDescription: string;
  receiptNo?: string;
  controlNumberId?: number;
  zanmalipo?: string;

  // optional enrichment fields
  customerName?: string;
  venueName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:6070/api/payments'; // ✅ your Spring Boot base URL

  constructor(private http: HttpClient) {}

  // Fetch all payments
  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/view/all`);
  }

  // Fetch payment by ID
  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/viewby-id/${id}`);
  }

  // Fetch payment by control number (zanmalipo)
  getPaymentsByControlNumber(controlNumber: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/by-control-number/${controlNumber}`);
  }
}
