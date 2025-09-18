import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffBookingService, Report } from '../../staff-booking.service';
import { Subscription } from 'rxjs';


interface DisplayReport extends Report {
  referenceDocument?: string[]; // optional, used in the UI only
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
    'forBookingId',
    'customerFullName',
    'customerPhone',
    'venueName',
    'price',
    'checkInTime',
    'checkOutTime',
    'conditionStatus',
    'conditionDescription'
  ];

  private venueId!: number;
  private sub?: Subscription;

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
    this.sub?.unsubscribe();
  }

  private loadReports(): void {
    const vid = sessionStorage.getItem('activeVenueId');
    if (!vid || +vid !== this.venueId) {
      this.venueId = +(vid || 0);
    }
    this.loading = true;
    this.errorMessage = null;

    this.sub = this.bookingService.getReportsByVenue(this.venueId).subscribe({
      next: (data: any[]) => {
        // Map the incoming objects into DisplayReport[].
        // We only map fields present in the existing Report interface + referenceDocument.
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
            // packageName removed as requested — keep empty string so it still matches Report shape
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

        // filter if you still want to only show those with a non-empty checkOutTime:
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
