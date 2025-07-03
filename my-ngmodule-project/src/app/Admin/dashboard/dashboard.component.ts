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
  totalBookedVenues: number = 0;  // new metric

  bookings: any[] = [];
  filteredBookings: any[] = [];
  venues: any[] = [];

  searchPhone: string = '';
  searchDate: string = '';
  router: any;

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
      booking.venue = matchedVenue || {};
    });

    this.filteredBookings = [...this.bookings];
  }

  loadDashboardData() {
    this.dashboardService.getAllBookings().subscribe(
      (data: any[]) => {
        this.bookings = data;
        this.filteredBookings = data;
        this.totalBookings = data.length;

        // Calculate totalUsers by counting distinct phone numbers
        const uniquePhones = new Set(
          data
            .map(b => b.customer?.phoneNumber)
            .filter(phone => phone) // filter out undefined or null
        );
        this.totalUsers = uniquePhones.size;

        // Calculate totalBookedVenues by counting bookings with status 'BOOKED'
        this.totalBookedVenues = data.filter(b => b.status === 'COMPLETE').length;
      },
      error => console.error('Error fetching bookings', error)
    );
  }

  searchBookings() {
    this.filteredBookings = this.bookings.filter(b => {
      const matchesPhone = this.searchPhone ? b.customer?.phoneNumber?.includes(this.searchPhone) : true;
      const matchesDate = this.searchDate ? b.startDate?.startsWith(this.searchDate) : true;
      return matchesPhone && matchesDate;
    });
  }

   goToBookingList() {
    this.router.navigate(['/admin/bookinglist']);
  }

  clearSearch() {
    this.searchPhone = '';
    this.searchDate = '';
    this.filteredBookings = this.bookings;
  }
}