import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private baseUrl = 'http://localhost:6070/api';

  constructor(private http: HttpClient) {}

  getPaymentsWithDetails(): Observable<any[]> {
    const payments$ = this.http.get<any[]>(`${this.baseUrl}/payments/view/all`);
    const controlNumbers$ = this.http.get<any[]>(`${this.baseUrl}/control-numbers/vew/all`);
    const invoices$ = this.http.get<any[]>(`${this.baseUrl}/invoices`);
    const bookings$ = this.http.get<any[]>(`${this.baseUrl}/bookings/view-all`);

    return forkJoin([payments$, controlNumbers$, invoices$, bookings$]).pipe(
      map(([payments, controlNumbers, invoices, bookings]) => {

        // Create maps for quick lookup
        const controlNumberMap = new Map(controlNumbers.map(cn => [cn.controlId, cn]));
        const invoiceMap = new Map(invoices.map(inv => [inv.invoiceId, inv]));
        const bookingMap = new Map(bookings.map(bk => [bk.bookingId, bk]));

        // Attach full details to payments
        return payments.map(payment => {
          const control = controlNumberMap.get(payment.controlNumberId);
          const invoice = control ? invoiceMap.get(control.invoiceId) : null;
          const booking = invoice ? bookingMap.get(invoice.bookingId) : null;

          return {
            ...payment,
            controlNumber: control || null,
            invoice: invoice || null,
            booking: booking || null,
            customer: booking?.customer || invoice?.customer || null,
            venue: booking?.venueName || invoice?.booking?.venueName || 'N/A'
          };
        });
      })
    );
  }
}
