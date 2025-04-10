import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InvoiceServiceService {
  private invoiceData: any = null;

  setInvoiceData(data: any) {
    this.invoiceData = data;
  }

  getInvoiceData() {
    return this.invoiceData;
  }
}