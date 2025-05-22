import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  


  private baseUrl = 'http://localhost:8080/api/invoices';

  constructor(private http: HttpClient) {}

  getInvoiceByBookingId(bookingId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/view/${bookingId}`);
  }}