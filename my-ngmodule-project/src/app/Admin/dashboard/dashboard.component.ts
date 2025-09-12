// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit,ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import {
  DashboardService,
  BestRevenueVenue,
  RawVenueRevenue
} from '../../Services/dashboard.service';

import { PdfViewerOverlayComponent } from '../pdf-viewer-overlay/pdf-viewer-overlay.component';

interface VenueRevenue {
  venueId: number;
  venueName: string;
  revenue: number;
}

interface TopVenue {
  venueName: string;
  bookingCount: number;
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
  monthlyLabel = '';

  mostBookedVenue: { venueName: string } | null = null;
  mostBookedCompletedVenue: { venueName: string } | null = null;

  availabilityDate: string = '';
  availableVenues: any[] = [];
  availableVenueCount = 0;
  availableError: string | null = null;

  bestRevenueVenue: BestRevenueVenue | null = null;
  topRevenueVenues: TopVenue[] = [];

  bookings: any[] = [];
  filteredBookings: any[] = [];
  venues: any[] = [];

  searchPhone = '';
  searchDate = '';

  /* ----------------- OVERLAY CONTROL PROPS (NEW) ----------------- */

  /** flag controlling visibility of the overlay component */
  showPdfOverlay = false;

  /** docs passed to overlay */
  selectedDocs: string[] = [];

  /** selected booking info passed to overlay */
  selectedBookingId?: number;
  selectedBookingCode?: string;
  pdfAuthToken?: string;

  /** ViewChild reference to call overlay cleanup before hiding */
  @ViewChild('pdfOverlay') pdfOverlay?: PdfViewerOverlayComponent;

  /* --------------------------------------------------------------- */

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private dialog: MatDialog
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

    this.dashboardService.getMonthlyRevenue()
      .subscribe((obj: { [key: string]: number }) => {
        const currentMonthKey = this.getCurrentMonthKey();

        if (obj.hasOwnProperty(currentMonthKey)) {
          this.monthlyLabel = currentMonthKey;
          this.monthlyRevenue = obj[currentMonthKey];
        } else {
          const entries = Object.entries(obj);
          if (entries.length) {
            [this.monthlyLabel, this.monthlyRevenue] = entries[0];
          } else {
            this.monthlyLabel = currentMonthKey;
            this.monthlyRevenue = 0;
          }
        }
      });
  }

  private getCurrentMonthKey(): string {
    const now = new Date();
    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY',
      'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER',
      'NOVEMBER', 'DECEMBER'
    ];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    return `${month} ${year}`;
  }

  private loadVenueStats() {
    this.dashboardService.getMostBookedVenue().subscribe(v => this.mostBookedVenue = v);
    this.dashboardService.getMostBookedCompletedVenue()
      .subscribe(v => this.mostBookedCompletedVenue = v);

    this.dashboardService.getBestRevenueVenue()
      .subscribe(v => this.bestRevenueVenue = v);

    this.dashboardService.getTopVenuesByRevenue()
      .subscribe((list) => {
        this.topRevenueVenues = list
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 3)
          .map(item => ({
            venueName:    item.venue.venueName,
            bookingCount: item.venue.bookingIds.length,
            revenue:      item.revenue
          }));
      });
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

    const sel = new Date(this.availabilityDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (sel < today) {
      this.availableError = "Can't check for past dates";
      this.availableVenues = [];
      this.availableVenueCount = 0;
      return;
    }
    this.availableError = null;

    this.dashboardService
      .getAvailableVenues(this.availabilityDate)
      .subscribe(response => {
        this.availableVenueCount = response.count;
        this.availableVenues      = response.venues;
      });
  }

  resetAvailableVenues() {
    this.availabilityDate = '';
    this.availableVenueCount = 0;
    this.availableVenues = [];
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

  /* ---------- new helper + dialog integration for dashboard preview ---------- */

  // Returns the last 5 bookings in reversed order (latest first)
  get recentBookings() {
    if (!this.filteredBookings) return [];
    const take = 5;
    return [...this.filteredBookings].slice(-take).reverse();
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'CANCELLED':
      case 'EXPIRED': return 'red';
      case 'IN_PROGRESS': return 'green';
      case 'COMPLETE': return 'blue';
      case 'PENDING': return 'goldenrod';
      default: return 'black';
    }
  }

  /**
   * Previously opened the Pdf viewer as a MatDialog.
   * Now we set selected docs and show the overlay component in the DOM.
   * This ONLY changes how the viewer is shown — logic for extracting docs is unchanged.
   */
  openReferenceDocs(booking: any) {
    const docs = booking?.customer?.referenceDocument ?? [];

    // set selected context
    this.selectedDocs = docs;
    this.selectedBookingId = booking?.bookingId ?? null;
    this.selectedBookingCode = booking?.bookingCode ?? null;

    // optional: set auth token if your app needs to pass it to overlay (JWT etc.)
    // this.pdfAuthToken = this.authService.getToken();

    // show overlay
    this.showPdfOverlay = true;

    // If you used to open MatDialog, that code is intentionally removed.
  }

  /**
   * Close the overlay — call overlay cleanup then hide it.
   * We call the overlay's `close()` method (which clears blob resources)
   * and then set the flag to false so the parent removes it from DOM.
   */
  closePdfPreview() {
  try {
    this.pdfOverlay?.close();
  } catch (e) {
    console.warn('Overlay cleanup failed or overlay not mounted yet', e);
  }

  this.showPdfOverlay = false;

  this.selectedDocs = [];
  this.selectedBookingId = undefined;
  this.selectedBookingCode = undefined;
}



}
