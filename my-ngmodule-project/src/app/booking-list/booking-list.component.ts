import { Component, OnInit } from '@angular/core';
import { Booking, BookingService } from '../Services/booking.service';

@Component({
  selector: 'app-booking-list',
  standalone: false,
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css'
})
export class BookingListComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: { [key: string]: Booking[] } = { PENDING: [], COMPLETE: [], CANCELLED: [] };
  showSection: string = ''; // default: don't show anything

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.fetchBookings();
  }

  fetchBookings(): void {
    this.bookingService.getBookings().subscribe((data) => {
      this.bookings = data;
      this.filterBookings();
    });
  }

  filterBookings(): void {
    this.filteredBookings = {
      PENDING: this.bookings.filter(b => b.status === 'PENDING'),
      COMPLETE: this.bookings.filter(b => b.status === 'COMPLETE'),
      CANCELLED: this.bookings.filter(b => b.status === 'CANCELLED'),
    };
  }
}
