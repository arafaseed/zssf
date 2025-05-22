import { Component, Input } from '@angular/core';
import jsPDF from 'jspdf';
import { InvoiceServiceService } from '../Services/invoice-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BookingService } from '../Services/booking.service';


import html2canvas from 'html2canvas';
import { InvoiceService } from '../Services/invoice.service';


@Component({
  selector: 'app-invoice',
  standalone: false,
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css',

})
export class InvoiceComponent  {
[x: string]: any;
  
  bookingId!: number;
  invoiceData: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.bookingId = +params['bookingId'];
      this.fetchInvoice();
    });
  }

  fetchInvoice(): void {
    this.invoiceService.getInvoiceByBookingId(this.bookingId).subscribe({
      next: (data) => {
        this.invoiceData = data;
        this.loading = false;
        this.generatePDF();
      },
      error: (err) => {
        console.error('Error fetching invoice:', err);
        this.loading = false;
      }
    });
  }

  generatePDF(): void {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('INVOICE', 90, 15);

    doc.setFontSize(12);
    doc.text(`Invoice Code: ${this.invoiceData.invoiceCode}`, 15, 30);
    doc.text(`Customer: ${this.invoiceData.customerName}`, 15, 40);
    doc.text(`Phone: ${this.invoiceData.customerPhone}`, 15, 50);
    doc.text(`Email: ${this.invoiceData.customerEmail}`, 15, 60);
    doc.text(`Date Issued: ${this.invoiceData.issuedDate}`, 15, 70);
    doc.text(`Status: ${this.invoiceData.status}`, 15, 80);
    doc.text(`Control Number: ${this.invoiceData.controlNumber}`, 15, 90);

    autoTable(doc, {
      startY: 100,
      head: [['Description', 'Amount']],
      body: [
        [this.invoiceData.description, `${this.invoiceData.amount.toLocaleString()} TZS`],
        ['Discount Applied', `${this.invoiceData.discountApplied.toLocaleString()} TZS`],
        ['Net Amount', `${this.invoiceData.netAmount.toLocaleString()} TZS`],
      ],
    });

    doc.save(`${this.invoiceData.invoiceCode}.pdf`);
  }
}

function autoTable(doc: jsPDF, arg1: { startY: number; head: string[][]; body: any[][]; }) {
  throw new Error('Function not implemented.');
}
