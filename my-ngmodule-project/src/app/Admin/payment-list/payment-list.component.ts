import { Component, OnInit } from '@angular/core';
import { Payment, PaymentService } from '../../Services/payment.service';

@Component({
  selector: 'app-payment-list',
  standalone: false,
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.css'
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  loading = true;
errorMessage: any;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments() {
    this.paymentService.getAllPayments().subscribe({
      next: (data) => {
        // enrich with customer and venue name if nested
        this.payments = data.map(p => ({
          ...p,
          customerName: (p as any).controlNumber?.invoice?.booking?.customer?.fullName || 'N/A',
          venueName: (p as any).controlNumber?.invoice?.booking?.venue?.venueName || 'N/A'
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading payments:', err);
        this.loading = false;
      }
    });
  }
}
