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
  filteredResults: Booking[] = [];
  searchDate: string = '';
  currentStatus: string = 'ALL';


    venueMap: { [key: number]: string } = {};
  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.fetchBookings();
  }

   fetchBookings(): void {
    this.bookingService.getAllVenues().subscribe(venues => {
      this.venueMap = {};
      venues.forEach(v => {
        this.venueMap[v.venueId] = v.venueName;
      });

      this.bookingService.getBookings().subscribe((data) => {
        this.bookings = data.map(b => ({
          ...b,
          venue: {
            ...b.venue,
            venueName: this.venueMap[b.venueId] || 'Unknown'
          }
        }));
        this.filteredResults = [...this.bookings];
      });
    });
  }
  filterByStatus(status: string): void {
    this.currentStatus = status;
    this.searchDate = ''; // reset search
    if (status === 'ALL') {
      this.filteredResults = [...this.bookings];
    } else {
      this.filteredResults = this.bookings.filter(b => b.status === status);
    }
  }

  searchByDate(): void {
    if (!this.searchDate) {
      this.filteredResults = this.currentStatus === 'ALL'
        ? [...this.bookings]
        : this.bookings.filter(b => b.status === this.currentStatus);
    } else {
      this.filteredResults = this.bookings.filter(b =>
        b.startDate === this.searchDate &&
        (this.currentStatus === 'ALL' || b.status === this.currentStatus)
      );
    }
  }
}