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
  const venues$ = this.http.get<any[]>(`${this.baseUrl}/venues/view/all`);

  return forkJoin([payments$, controlNumbers$, invoices$, bookings$, venues$]).pipe(
    map(([payments, controlNumbers, invoices, bookings, venues]) => {

      // Lookup maps
      const controlNumberMap = new Map(controlNumbers.map(cn => [cn.controlId, cn]));
      const invoiceMap = new Map(invoices.map(inv => [inv.invoiceId, inv]));
      const bookingMap = new Map(bookings.map(bk => [bk.bookingId, bk]));
      const venueMap = new Map(venues.map(vn => [vn.venueId, vn]));

    return payments.map(payment => {
  const control = controlNumberMap.get(payment.controlNumberId);
  const invoice = control ? invoiceMap.get(control.invoiceId) : null;

  // Extract booking & customer
  const booking = invoice?.booking || null;
  const customer = booking?.customer || invoice?.customer || null;

  // Extract fields safely
  const venueName = booking?.venueName || 'N/A';
  const venueActivity = booking?.venueActivityName || 'N/A';
  const customerPhone = customer?.phoneNumber || 'N/A';

  console.log('--- PAYMENT DEBUG ---');
  console.log('Payment ID:', payment.paymentId);
  console.log('Venue:', venueName);
  console.log('Activity:', venueActivity);
  console.log('Customer:', customer?.customerName, '-', customerPhone);
  console.log('---------------------');

  return {
    ...payment,
    controlNumber: control || null,
    invoice: invoice || null,
    booking: booking || null,
    customer,
    venue: venueName,
    activity: venueActivity,
    customerPhone
  };
});

    })
  );
}
}
