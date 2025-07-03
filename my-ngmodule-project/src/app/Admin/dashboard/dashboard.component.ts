import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  totalBookedVenues: number = 0;

  bookings: any[] = [];
  filteredBookings: any[] = [];
  venues: any[] = [];

  searchPhone: string = '';
  searchDate: string = '';

  constructor(
    private dashboardService: DashboardService,
    private router: Router 
  ) {}

  ngOnInit() {
    this.loadDashboardData();

    this.dashboardService.getAllVenues().subscribe(
      (venues) => {
        this.venues = venues;
        this.attachVenueNames();
      },
      (error) => console.error('Error fetching venues', error)
    );
  }

  loadDashboardData() {
    this.dashboardService.getAllBookings().subscribe(
      (data: any[]) => {
        this.bookings = data;
        this.filteredBookings = data;
        this.totalBookings = data.length;

        // Count unique users by phone number
        const uniquePhones = new Set(
          data.map(b => b.customer?.phoneNumber).filter(phone => phone)
        );
        this.totalUsers = uniquePhones.size;

        // Count bookings with status 'COMPLETE'
        this.totalBookedVenues = data.filter(b => b.status === 'COMPLETE').length;
      },
      error => console.error('Error fetching bookings', error)
    );
  }

  attachVenueNames() {
    this.bookings.forEach(booking => {
      const matchedVenue = this.venues.find(v => v.venueId === booking.venueId);
      booking.venue = matchedVenue || {};
    });

    this.filteredBookings = [...this.bookings];
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

  goToBookingList() {
    this.router.navigate(['/admin/bookinglist']); 
  }
}
