import { Component, OnInit } from '@angular/core';
import {  PaymentService } from '../../Services/payment.service';


@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  standalone:false,
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {
  payments: any[] = [];
  loading = true;


  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.paymentService.getPaymentsWithDetails().subscribe({
      next: (data) => {
        this.payments = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching payments', err);
        this.loading = false;
      }
    });
  }
}