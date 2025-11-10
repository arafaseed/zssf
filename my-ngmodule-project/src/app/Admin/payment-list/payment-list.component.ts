import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Payment, PaymentService } from '../../Services/payment.service';


@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  standalone:false,
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  loading = true;
  errorMessage = '';

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadAllPayments();
  }

  loadAllPayments() {
    forkJoin({
      payments: this.paymentService.getPayments(),
      customers: this.paymentService.getCustomers(),
      venues: this.paymentService.getVenues()
    }).subscribe({
      next: ({ payments, customers, venues }) => {
        this.payments = payments.map(p => {
          // Match customer via booking IDs
          const customer = customers.find(c =>
            c.bookingIds?.includes(p.controlNumberId)
          );
          // Match venue via controlNumberId or adjust as needed
          const venue = venues.find(v =>
            v.venueId === p.controlNumberId
          );

          return {
            ...p,
            customerName: customer?.customerName || 'N/A',
            venueName: venue?.venueName || 'N/A'
          };
        });
        this.loading = false;
      },
      error: err => {
        console.error('Error loading payments:', err);
        this.errorMessage = 'Failed to load payments.';
        this.loading = false;
      }
    });
  }
}
