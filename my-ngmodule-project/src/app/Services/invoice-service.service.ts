import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class InvoiceServiceService {

  private baseUrl = `${environment.apiUrl}/api/invoices`; // Adjust if your backend runs elsewhere

  private invoiceData: any; // For sharing invoice between components

  constructor(private http: HttpClient) {}

  // Create Invoice
  createInvoice(bookingId: number, discountRate?: number): Observable<any> {
    let params = new HttpParams().set('bookingId', bookingId.toString());
    if (discountRate != null) {
      params = params.set('discountRate', discountRate.toString());
    }
    return this.http.post(`${this.baseUrl}/create`, null, { params });
  }

  // Get Invoice by ID
  getInvoiceById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/view/${id}`);
  }

  // Get by Invoice Code
  getInvoiceByCode(code: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/view/by-code`, {
      params: { invoiceCode: code }
    });
  }

  // Get by Control Number
  getInvoiceByControlNumber(controlNumber: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/view/by-control-number`, {
      params: { controlNumber }
    });
  }

  // Get by Booking ID
  getInvoiceByBookingId(bookingId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/view/by-booking`, {
      params: { bookingId }
    });
  }

  // Get Invoices by Status
  getInvoicesByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/view/by-status`, {
      params: { status }
    });
  }

  // Get Invoices by Issued Date (format: YYYY-MM-DD)
  getInvoicesByIssuedDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/view/by-issued-date`, {
      params: { date }
    });
  }

  // For internal sharing between components
  setInvoiceData(data: any) {
    this.invoiceData = data;
  }

  getInvoiceData() {
    return this.invoiceData;
  }
}
