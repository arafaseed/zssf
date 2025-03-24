import { Component, Input } from '@angular/core';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-invoice',
  standalone: false,
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css'
})
export class InvoiceComponent {
  @Input() invoiceData: any; // Receive invoice data as input

  downloadInvoice() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Invoice', 20, 20);
    
    let y = 40;
    doc.setFontSize(12);
    doc.text(`Customer: ${this.invoiceData.customerName}`, 20, y);
    doc.text(`Email: ${this.invoiceData.email}`, 20, y + 10);
    doc.text(`Phone: ${this.invoiceData.phone}`, 20, y + 20);
    doc.text(`Venue: ${this.invoiceData.venue}`, 20, y + 30);
    doc.text(`Event Date: ${this.invoiceData.eventDate}`, 20, y + 40);
    doc.text(`Total Amount: ${this.invoiceData.totalAmount} USD`, 20, y + 50);
    doc.text(`Payment Status: ${this.invoiceData.paymentStatus}`, 20, y + 60);
    
    doc.save(`Invoice_${this.invoiceData.invoiceNumber}.pdf`);
  }


}
