import { Component, OnInit } from '@angular/core';
import { Booking, BookingService } from '../../Services/booking.service';

@Component({
  selector: 'app-booking-list',
  standalone: false,
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.css'
})
export class BookingListComponent implements OnInit {
   bookings: Booking[] = [];
  filteredResults: Booking[] = [];
  searchDate: string = '';
  currentStatus: string = 'ALL';

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.fetchBookings();
  }

fetchBookings(): void {
  this.bookingService.getBookings().subscribe((data) => {
    // Sort by startDate
    this.bookings = data.sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // Fetch venue names from venue table
    this.bookings.forEach((booking) => {
      this.bookingService.getVenueNameById(booking.venueId).subscribe((name) => {
        booking.venueName = name; // Add venueName dynamically
      });
    });

    this.filteredResults = [...this.bookings]; // Show all by default
  });
}



  filterByStatus(bookingStatus: string): void {
    this.currentStatus = bookingStatus;
    this.searchDate = ''; // reset search
    if (bookingStatus === 'ALL') {
      this.filteredResults = [...this.bookings];
    } else {
      this.filteredResults = this.bookings.filter(b => b.bookingStatus === bookingStatus);
    }
  }

  searchByDate(): void {
    if (!this.searchDate) {
      this.filteredResults = this.currentStatus === 'ALL'
        ? [...this.bookings]
        : this.bookings.filter(b => b.bookingStatus === this.currentStatus);
    } else {
      this.filteredResults = this.bookings.filter(b =>
        b.startDate === this.searchDate &&
        (this.currentStatus === 'ALL' || b.bookingStatus === this.currentStatus)
      );
    }
  }
}