import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../Services/payment.service';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  standalone: false,
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit {
  payments: any[] = [];
  venues: string[] = [];
  loading = true;

  filterPhone: string = '';
  filterVenue: string = '';
  venueSearch: string = '';
  venueDropdownOpen = false;
  filterDate: string = '';

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.paymentService.getPaymentsWithDetails().subscribe({
      next: (data) => {
        this.payments = data;
        this.venues = [...new Set(data.map(p => p.venue).filter(v => v))]; // unique venues
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching payments', err);
        this.loading = false;
      }
    });
  }

  // Filter payments table
  filteredPayments(): any[] {
    return this.payments.filter(payment => {
      const matchesPhone = !this.filterPhone || payment.customerPhone?.includes(this.filterPhone);
      const matchesVenue = !this.filterVenue || payment.venue === this.filterVenue;
      const matchesDate = !this.filterDate || (new Date(payment.paymentDate).toISOString().split('T')[0] === this.filterDate);
      return matchesPhone && matchesVenue && matchesDate;
    });
  }

  // Filter venues based on input
  filteredVenueList(): string[] {
    return this.venues.filter(v => v.toLowerCase().includes(this.venueSearch.toLowerCase()));
  }

  // Select venue from dropdown
  selectVenue(venue: string) {
    this.filterVenue = venue;
    this.venueSearch = venue;
    this.venueDropdownOpen = false;
  }

  // Close dropdown with delay to allow click
  closeVenueDropdown() {
    setTimeout(() => {
      this.venueDropdownOpen = false;
    }, 150);
  }
}
