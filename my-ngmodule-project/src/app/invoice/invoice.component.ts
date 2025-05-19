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
export class InvoiceComponent {
  invoice: any = null;
  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private multiStepFormService: MultiStepFormService,
    private invoiceService: InvoiceServiceService,  // Inject InvoiceService
    private snackBar: MatSnackBar,
    private router: Router,  // Inject Router
    private route: ActivatedRoute
  ) {}
  

  
  ngOnInit(): void {
    this.invoice = this.invoiceService.getInvoiceData();
    if (!this.invoice) {
      alert('No invoice data found!');
      this.router.navigate(['/venue']);
    }
    this.invoice.invoiceNumber = this.invoice.invoiceCode;
    this.invoice.date = this.invoice.date;
    // this.invoice.customerName = this.invoice.booking.customer.fullName;
    // this.invoice.customerEmail = this.invoice.booking.customer.email;
    // this.invoice.customerPhone = this.invoice.booking.customer.phone;
    // this.invoice.venue = this.invoice.booking.venue.venueName;
    this.invoice.customerName = this.invoice.customerName;
this.invoice.customerEmail = this.invoice.customerEmail;
this.invoice.customerPhone = this.invoice.customerPhone;
this.invoice.venue = this.invoice.venue;
    this.invoice.eventDate = this.invoice.booking.startDate;
    this.invoice.amount = this.invoice.netAmount;
    this.invoice.paymentType = this.invoice.status;
    this.invoice.controlNumber = this.invoice.controlNumber || 'N/A';




  }
  

  printInvoice(): void {
    const doc = new jsPDF();
    doc.text("Invoice", 90, 10);
    doc.text(`Invoice Number: ${this.invoice.invoiceNumber}`, 20, 30);
    doc.text(`Date: ${this.invoice.date}`, 20, 40);
    doc.text(`Customer Name: ${this.invoice.customerName}`, 20, 50);
    doc.text(`Email: ${this.invoice.customerEmail}`, 20, 60);
    doc.text(`Phone: ${this.invoice.customerPhone}`, 20, 70);
    doc.text(`Venue: ${this.invoice.venue}`, 20, 80);
    doc.text(`Event Date: ${this.invoice.eventDate}`, 20, 90);
    doc.text(`Amount: $${this.invoice.amount}`, 20, 100);
    // doc.text(`Payment Type: ${this.invoice.paymentType}`, 20, 110);
    //  doc.text(`Control Number: ${this.invoice.controlNumber}`, 20, 130);
    doc.text(`Payment Type: ${this.invoice.paymentType}`, 20, 110);
    doc.text(`Control Number: ${this.invoice.controlNumber}`, 20, 130);
    doc.save("Invoice.pdf");
  }
  
}