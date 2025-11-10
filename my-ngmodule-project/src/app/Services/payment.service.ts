import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';

export interface Payment {
  paymentId: number;
  paymentDate: string;
  amountPaid: number;
  controlNumberId: number;
  zanmalipo?: string;
  customerName?: string;
  venueName?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = 'http://localhost:6070/api'; // your backend

  constructor(private http: HttpClient) {}

  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.baseUrl}/payments/view/all`);
  }

  getCustomers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/customers`);
  }

  getVenues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/venues/view/all`);
  }
}
