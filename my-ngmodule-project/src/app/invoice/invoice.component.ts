import { Component, Input } from '@angular/core';
import jsPDF from 'jspdf';
import { InvoiceServiceService } from '../Services/invoice-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MultiStepFormService } from '../multi-step-form.service';
import { BookingService } from '../Services/booking.service';


@Component({
  selector: 'app-invoice',
  standalone: false,
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css',

})
export class InvoiceComponent  {
  invoice: any;
invoiceData: any;

  constructor(private formService: MultiStepFormService) {}

  ngOnInit(): void {
    const bookingId = 123; // or get this dynamically
    this.formService.getInvoiceByBookingId(bookingId).subscribe({
      next: (data) => {
        this.invoiceData = data;
      },
      error: (err) => {
        console.error('Error loading invoice', err);
      }
    });
  }
}