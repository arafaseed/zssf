import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffBookingService, Report } from '../../staff-booking.service';

@Component({
  selector: 'app-reports',
  standalone:false,
  templateUrl: './reports.component.html',
  styles: []
})
export class ReportsComponent implements OnInit, OnDestroy {
  reports: Report[] = [];
  loading = true;
  errorMessage: string | null = null;

  private venueId!: number;

  constructor(private bookingService: StaffBookingService) {}

  ngOnInit(): void {
    const vid = sessionStorage.getItem('activeVenueId');
    if (!vid) {
      this.errorMessage = 'No venue selected. Please choose a venue.';
      this.loading = false;
      return;
    }
    this.venueId = +vid;
     this.loadReports();
  }

  ngOnDestroy(): void {
  }

  private loadReports(): void {
    const vid = sessionStorage.getItem('activeVenueId');
    if (!vid || +vid !== this.venueId) {
      this.venueId = +(vid || 0);
    }
    this.loading = true;
    this.errorMessage = null;

    this.bookingService.getReportsByVenue(this.venueId).subscribe({
      next: data => {
        this.reports = data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Failed to load reports.';
        this.loading = false;
      }
    });
  }
}
