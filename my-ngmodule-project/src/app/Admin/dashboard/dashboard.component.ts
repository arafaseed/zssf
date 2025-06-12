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

  searchPhone: string = '';
  searchDate: string = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
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
