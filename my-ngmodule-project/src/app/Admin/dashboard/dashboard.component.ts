import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from '../../Services/dashboard.service';

interface VenueRevenue {
  venueId: number;
  venueName: string;
  revenue: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalBookings = 0;
  totalUsers = 0;
  totalBookedVenues = 0;

  totalRevenue = 0;
  monthlyRevenue = 0;

  mostBookedVenue: { venueName: string } | null = null;
  mostBookedCompletedVenue: { venueName: string } | null = null;

  availabilityDate: string = '';
  availableVenues: { venueId: number; venueName: string }[] = [];

  bestRevenueVenue: VenueRevenue | null = null;
  topRevenueVenues: VenueRevenue[] = [];

  bookings: any[] = [];
  filteredBookings: any[] = [];
  venues: any[] = [];

  searchPhone = '';
  searchDate = '';

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadRevenueData();
    this.loadVenueStats();
  }

  private loadDashboardData() {
    this.dashboardService.getAllBookings().subscribe(data => {
      this.bookings = data;
      this.filteredBookings = [...data];
      this.totalBookings = data.length;
      const uniquePhones = new Set(data.map(b => b.customer?.phoneNumber).filter(p=>p));
      this.totalUsers = uniquePhones.size;
      this.totalBookedVenues = data.filter(b => b.status === 'COMPLETE').length;
      this.attachVenueNames();
    });
  }

  private loadRevenueData() {
    this.dashboardService.getTotalRevenue().subscribe(r => this.totalRevenue = r);
    this.dashboardService.getMonthlyRevenue().subscribe(r => this.monthlyRevenue = r);
  }

  private loadVenueStats() {
    this.dashboardService.getMostBookedVenue().subscribe(v => this.mostBookedVenue = v);
    this.dashboardService.getMostBookedCompletedVenue()
      .subscribe(v => this.mostBookedCompletedVenue = v);

    this.dashboardService.getBestRevenueVenue()
      .subscribe(v => this.bestRevenueVenue = v);

    this.dashboardService.getTopVenuesByRevenue()
      .subscribe(list => this.topRevenueVenues = list.slice(0,3));
  }

  attachVenueNames() {
    this.dashboardService.getAllVenues().subscribe(vs => {
      this.venues = vs;
      this.bookings.forEach(b => {
        b.venue = vs.find(v => v.venueId === b.venueId) || {};
      });
      this.filteredBookings = [...this.bookings];
    });
  }

  loadAvailableVenues() {
    if (!this.availabilityDate) return;
    this.dashboardService.getAvailableVenues(this.availabilityDate)
      .subscribe(vs => this.availableVenues = vs);
  }

  searchBookings() {
    this.filteredBookings = this.bookings.filter(b => {
      const mp = this.searchPhone ? b.customer?.phoneNumber?.includes(this.searchPhone) : true;
      const md = this.searchDate ? b.startDate?.startsWith(this.searchDate) : true;
      return mp && md;
    });
  }

  clearSearch() {
    this.searchPhone = '';
    this.searchDate = '';
    this.filteredBookings = [...this.bookings];
  }

  goToBookingList() {
    this.router.navigate(['/admin/bookinglist']);
  }
}
