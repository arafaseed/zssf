import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../Services/dashboard.service';


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
   totalBookings: number = 0;
  totalUsers: number = 0;
  venueAvailability: string = 'N/A';
  bookings: any[] = [];
  filteredBookings: any[] = [];
  venues: any[] = [];

  searchPhone: string = '';
  searchDate: string = '';

  constructor(private dashboardService: DashboardService) {}

ngOnInit() {
  this.loadDashboardData();

  this.dashboardService.getAllVenues().subscribe(
    (venues) => {
      this.venues = venues;
      this.attachVenueNames(); // match venue names to bookings
    },
    (error) => console.error('Error fetching venues', error)
  );
}
attachVenueNames() {
  this.bookings.forEach(booking => {
    const matchedVenue = this.venues.find(v => v.venueId === booking.venueId);
    booking.venue = matchedVenue || {}; // safely add venue object
  });

  this.filteredBookings = [...this.bookings]; // re-assign to trigger Angular change detection
}


  loadDashboardData() {
    this.dashboardService.getAllBookings().subscribe(
      (data: any[]) => {
        this.bookings = data;
        this.filteredBookings = data; // default view
        this.totalBookings = data.length;

        const totalVenues = 100;
        const bookedVenues = data.filter(b => b.status === 'BOOKED').length;
        this.venueAvailability = `${100 - (bookedVenues / totalVenues * 100)}%`;
      },
      error => console.error('Error fetching bookings', error)
    );

    this.totalUsers = 350;
  }

  searchBookings() {
    this.filteredBookings = this.bookings.filter(b => {
      const matchesPhone = this.searchPhone ? b.customer?.phoneNumber?.includes(this.searchPhone) : true;
      const matchesDate = this.searchDate ? b.startDate?.startsWith(this.searchDate) : true;
      return matchesPhone && matchesDate;
    });
  }
  

  clearSearch() {
    this.searchPhone = '';
    this.searchDate = '';
    this.filteredBookings = this.bookings;
  }
}
