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

  // Wrap and print long description
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxLineWidth = pageWidth - margin * 2;

  const descriptionLines = doc.splitTextToSize(this.invoiceData.description, maxLineWidth);
  
  doc.text('Description:', margin, 100);
  doc.text(descriptionLines, margin, 110);

  doc.text('Amount:', margin, 110 + descriptionLines.length * 10);
  doc.text(`${this.invoiceData.amount.toLocaleString()} TZS`, margin + 30, 110 + descriptionLines.length * 10);

  doc.text('Discount Applied:', margin, 120 + descriptionLines.length * 10);
  doc.text(`${this.invoiceData.discountApplied.toLocaleString()} TZS`, margin + 50, 120 + descriptionLines.length * 10);

  doc.text('Net Amount:', margin, 130 + descriptionLines.length * 10);
  doc.text(`${this.invoiceData.netAmount.toLocaleString()} TZS`, margin + 30, 130 + descriptionLines.length * 10);

  doc.save(`${this.invoiceData.invoiceCode}.pdf`);
}



printInvoice(): void {
  const printContents = document.getElementById('invoice')?.innerHTML;
  if (!printContents) return;

  const popupWin = window.open('', '_blank', 'width=800,height=600');
  if (!popupWin) return;

  popupWin.document.open();
  popupWin.document.write(`
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
          /* Add any styles for print here */
          body { font-family: Arial, sans-serif; padding: 20px; }
          .invoice-container { max-width: 600px; margin: auto; }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div class="invoice-container">
          ${printContents}
        </div>
      </body>
    </html>`);
  popupWin.document.close();
}

}