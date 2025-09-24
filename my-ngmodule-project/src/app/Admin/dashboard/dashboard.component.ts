import { Component, OnInit, ViewChild } from '@angular/core';
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

interface BookingStat {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED' | 'EXPIRED' | string;
  count: number;
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
  showPdfOverlay = false;
  selectedDocs: string[] = [];
  selectedBookingId?: number;
  selectedBookingCode?: string;
  pdfAuthToken?: string;
  @ViewChild('pdfOverlay') pdfOverlay?: PdfViewerOverlayComponent;
  /* --------------------------------------------------------------- */

  // New: booking stats for year/month
  statsYear: number = new Date().getFullYear();
  statsMonth: string = (() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  })();

  yearlyStats: BookingStat[] = [];
  monthlyStats: BookingStat[] = [];

  /**
   * NEW minimal property: bound to the <select> in template so switching is immediate.
   * Default to YEARLY to preserve previous behaviour.
   */
  viewMode: 'YEARLY' | 'MONTHLY' = 'YEARLY';

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadRevenueData();
    this.loadVenueStats();
    this.loadBookingStatsYear(this.statsYear);
    const [yStr, mStr] = this.statsMonth.split('-');
    this.loadBookingStatsMonth(Number(yStr), Number(mStr));
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

  statBarWidth(count: number): string {
    const max = Math.max(1, ...this.yearlyStats.map(s => s.count), ...this.monthlyStats.map(s => s.count), 10);
    const pct = Math.round(Math.min(100, (count / max) * 100));
    return `${pct}%`;
  }

  loadBookingStatsYear(year?: number) {
    const y = year ?? this.statsYear ?? new Date().getFullYear();
    this.statsYear = y;
    this.dashboardService.getYearlyBookingStats(y).subscribe({
      next: (data: BookingStat[]) => {
        this.yearlyStats = this.normalizeStatsArray(data);
      },
      error: (err) => {
        console.error('Failed to load yearly stats', err);
        this.yearlyStats = [];
      }
    });
  }

  loadBookingStatsMonthFromInput() {
    if (!this.statsMonth) return;
    const [yStr, mStr] = (this.statsMonth || '').split('-');
    const year = Number(yStr);
    const month = Number(mStr);
    if (!year || !month) return;
    this.loadBookingStatsMonth(year, month);
  }

  loadBookingStatsMonth(year: number, month: number) {
    this.dashboardService.getMonthlyBookingStats(year, month).subscribe({
      next: (data: BookingStat[]) => {
        this.monthlyStats = this.normalizeStatsArray(data);
      },
      error: (err) => {
        console.error('Failed to load monthly stats', err);
        this.monthlyStats = [];
      }
    });
  }

  private normalizeStatsArray(data: BookingStat[]): BookingStat[] {
    const wanted = ['PENDING','IN_PROGRESS','COMPLETE','CANCELLED','EXPIRED'];
    const map = new Map<string, number>();
    (data || []).forEach(x => map.set(x.status, x.count ?? 0));
    return wanted.map(s => ({ status: s, count: map.get(s) ?? 0 }));
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

  get recentBookings() {
    if (!this.filteredBookings) return [];
    const take = 5;
    return [...this.filteredBookings].slice(-take).reverse();
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'CANCELLED': return 'red';
      case 'EXPIRED': return 'grey';
      case 'IN_PROGRESS': return 'yellow';
      case 'COMPLETE': return 'green';
      case 'PENDING': return 'goldenrod';
      default: return 'black';
    }
  }

  openReferenceDocs(booking: any) {
    const docs = booking?.customer?.referenceDocument ?? [];

    this.selectedDocs = docs;
    this.selectedBookingId = booking?.bookingId ?? null;
    this.selectedBookingCode = booking?.bookingCode ?? null;

    // optional: set auth token if your app needs to pass it to overlay (JWT etc.)
    // this.pdfAuthToken = this.authService.getToken();

    this.showPdfOverlay = true;
  }

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

  /**
   * NEW: called when the view mode select changes.
   * Behavior:
   *  - Immediately switch the UI to show cached stats (if any) for the chosen view.
   *  - Only call the service to reload if we don't already have data for the target view/year/month.
   *
   * This is intentionally lightweight and does not remove any of your existing logic.
   */
  onViewModeChange() {
    if (this.viewMode === 'YEARLY') {
      // If we already have yearlyStats for the selected year, just show them immediately.
      if (!this.yearlyStats || !this.yearlyStats.length) {
        this.loadBookingStatsYear(this.statsYear);
      }
      // nothing else required — template reads yearlyStats directly
    } else {
      // MONTHLY
      // If monthlyStats are not present for the currently selected month, load them.
      if (!this.monthlyStats || !this.monthlyStats.length) {
        // statsMonth is "YYYY-MM". Try parsing and load.
        this.loadBookingStatsMonthFromInput();
      }
    }
  }
}
