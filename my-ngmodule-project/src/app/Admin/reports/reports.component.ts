import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffBookingService, Report } from '../../staff/staff-booking.service';
import { Subscription } from 'rxjs';
import { ViewVenueService } from '../../Services/view-venue.service';

interface DisplayReport extends Report {
  referenceDocument?: string[]; // optional, used in the UI only
}

interface SimpleVenue {
  venueId: number;
  venueName: string;
}

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.component.html',
  styles: []
})
export class ReportsComponent implements OnInit, OnDestroy {
  reports: DisplayReport[] = [];
  loading = true;
  errorMessage: string | null = null;

  displayedColumns: string[] = [
   
    'customerFullName',
    'customerPhone',
    'venueName',
    'price',
    'checkInTime',
    'checkOutTime',
    'conditionStatus',
    'conditionDescription'
  ];

  // currently selected venue id (used to request reports)
  // make this public so template can read it easily
  venueId: number | null = null;
  private sub?: Subscription;

  // venues loaded from ViewVenueService
  venues: SimpleVenue[] = [];
  venuesLoading = false;
  venuesError: string | null = null;

  constructor(
    private bookingService: StaffBookingService,
    private viewVenueService: ViewVenueService
  ) {}

  ngOnInit(): void {
    // Load all venues, then pick activeVenueId from sessionStorage (or default to first)
    this.loadVenues();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /**
   * Load available venues for the horizontal selector.
   * After loading, we determine the active venue id (from sessionStorage or default to first),
   * store it (if absent) and call loadReports() to fetch reports for that venue.
   */
  private loadVenues(): void {
    this.venuesLoading = true;
    this.venuesError = null;

    this.viewVenueService.getAllVenues().subscribe({
      next: (vs: any[]) => {
        // Expecting each venue to at least have venueId and venueName
        this.venues = (vs || []).map(v => ({
          venueId: v.venueId ?? v.id ?? 0,
          venueName: v.venueName ?? v.name ?? 'Unnamed Venue'
        })).filter(v => v.venueId); // filter out invalid entries

        this.venuesLoading = false;

        if (!this.venues.length) {
          this.errorMessage = 'No venues available. Please create a venue first.';
          this.loading = false;
          return;
        }

        // Resolve active venue id: prefer sessionStorage value if valid
        const stored = sessionStorage.getItem('activeVenueId');
        const storedId = stored ? Number(stored) : null;
        const validStored = storedId && this.venues.some(v => v.venueId === storedId);

        if (validStored) {
          this.venueId = storedId;
        } else {
          // Default to first venue and persist to sessionStorage for app-wide consistency
          this.venueId = this.venues[0].venueId;
          sessionStorage.setItem('activeVenueId', String(this.venueId));
        }

        // Now load reports for the selected venue
        this.loadReports();
      },
      error: err => {
        console.error('Failed to load venues', err);
        this.venuesLoading = false;
        this.venuesError = 'Failed to load venues.';
        this.errorMessage = 'Failed to load venues.';
        this.loading = false;
      }
    });
  }

  /**
   * Called when a venue button is clicked.
   * Stores only the venue id to sessionStorage, sets the local venueId,
   * unsubscribes any previous report stream, and reloads reports for the chosen venue.
   */
  selectVenue(venueId: number): void {
    if (!venueId) return;

    // Persist the selection (only the id) so other parts of the app can use it
    sessionStorage.setItem('activeVenueId', String(venueId));

    // update local id and refresh reports
    this.venueId = venueId;

    // Immediately cancel any in-flight report subscription to keep UI responsive
    this.sub?.unsubscribe();
    this.loadReports();
  }

  /**
   * Loads reports for the currently selected this.venueId.
   * Keeps original mapping + filtering logic intact.
   */
  private loadReports(): void {
    // If for some reason venueId is not set, try sessionStorage
    const vid = sessionStorage.getItem('activeVenueId');
    if ((this.venueId === null || this.venueId === undefined) && vid) {
      this.venueId = +vid;
    }

    if (!this.venueId) {
      this.errorMessage = 'No venue selected. Please choose a venue.';
      this.loading = false;
      return;
    }

    // Begin load (UI)
    this.loading = true;
    this.errorMessage = null;

    // Ensure previous subscription is cleared (safety)
    this.sub?.unsubscribe();

    this.sub = this.bookingService.getReportsByVenue(this.venueId).subscribe({
      next: (data: any[]) => {
        const mapped: DisplayReport[] = (data || []).map((r: any) => {
          const forBooking = r.forBooking ?? null;
          const customer = forBooking?.customer ?? {};
          return {
            handOverId: r.handOverId,
            forBookingId: r.forBookingId ?? forBooking?.bookingId ?? null,
            venueId: r.forVenueId ?? forBooking?.venueId ?? null,
            venueName: r.forVenueName ?? forBooking?.venueName ?? '',
            customerFullName: (customer?.customerName ?? r.customerFullName ?? '') as string,
            customerPhone: (customer?.phoneNumber ?? r.customerPhone ?? '') as string,
            packageName: '' as any,
            activityName: forBooking?.venueActivityName ?? '',
            price: (forBooking?.venueActivityPrice ?? r.price ?? 0) as number,
            checkInTime: r.checkInTime ?? null,
            checkOutTime: r.checkOutTime ?? null,
            conditionStatus: r.conditionStatus ?? null,
            conditionDescription: r.conditionDescription ?? null,
            referenceDocument: Array.isArray(customer?.referenceDocument) ? customer.referenceDocument : []
          };
        });

        const filtered = this.filterReportsWithCheckOutTime(mapped);
        this.reports = filtered;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Failed to load reports.';
        this.loading = false;
      }
    });
  }

  /**
   * Filters out reports that have a missing, null, or empty checkOutTime.
   */
  private filterReportsWithCheckOutTime(reports: DisplayReport[]): DisplayReport[] {
    return reports.filter(r =>
      r.checkOutTime !== null &&
      r.checkOutTime !== undefined &&
      (typeof r.checkOutTime !== 'string' || r.checkOutTime.trim() !== '')
    );
  }
}
