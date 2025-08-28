import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VenueService } from '../../Services/venue.service';
import { BuildingService } from '../../Services/building.service';
import { ActivityService } from '../../Services/activity.service';
import { OptionalServiceService } from '../../Services/optional.service';
import { forkJoin, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BookingModalComponent } from '../booking-modal/booking-modal.component';
import { trigger, style, animate, transition } from '@angular/animations';
import { AvailabilityModalComponent } from '../availability-modal/availability-modal.component';

@Component({
  selector: 'app-venue-explorer',
  standalone: false,
  templateUrl: './venue-explorer.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class VenueExplorerComponent implements OnInit {
  venue: any = null;
  building: any = null;
  activities: any[] = [];
  optionalServices: any[] = [];
  minActivityPrice: number | null = null;
  loading = true;
  currentImageIndex = 0;

  // availability form model
  startDate!: Date | null;
  startTime = '09:00';
  endDate!: Date | null;
  endTime = '17:00';
  selectedActivityId?: number;

  // date validation helpers
  minDate: Date = new Date(); // today (includes time) — normalized in checks
  startDateInvalid = false;
  endDateInvalid = false;
  formError = '';

  constructor(
    private route: ActivatedRoute,
    private venueSvc: VenueService,
    private buildingSvc: BuildingService,
    private activitySvc: ActivityService,
    private optionalSvc: OptionalServiceService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    // normalize minDate to midnight for comparisons
    this.minDate = this.normalizeDate(this.minDate);
    this.loadAll(id);
  }

  loadAll(venueId: number) {
    this.loading = true;
    this.currentImageIndex = 0;
    this.venueSvc.getVenue(venueId).subscribe({
      next: (v) => {
        this.venue = v;
        // fetch building
        this.buildingSvc
          .getBuilding(v.buildingId)
          .subscribe((b) => (this.building = b));
        // fetch activities and optional services in parallel
        const actObs =
          v.activityIds && v.activityIds.length
            ? forkJoin(
                v.activityIds.map((aid: number) =>
                  this.activitySvc.getActivityById(aid)
                )
              )
            : of([]);
        const optObs =
          v.optionalServiceIds && v.optionalServiceIds.length
            ? forkJoin(
                v.optionalServiceIds.map((sid: number) =>
                  this.optionalSvc.getServiceById(sid)
                )
              )
            : of([]);

        forkJoin([actObs, optObs]).subscribe({
          next: ([actsRaw, optsRaw]: any) => {
            // filter nulls and normalize
            this.activities = (actsRaw || []).filter(Boolean);
            this.optionalServices = (optsRaw || []).filter(Boolean);
            // compute min activity price
            const prices = this.activities
              .map((a: any) => Number(a.price))
              .filter((p) => !isNaN(p));
            this.minActivityPrice = prices.length
              ? Math.round(Math.min(...prices))
              : null;
            // default select first activity if present
            if (this.activities.length) {
              const maxPriceActivity = this.activities.reduce((prev, curr) =>
                Number(curr.price) > Number(prev.price) ? curr : prev
              );
              this.selectedActivityId = maxPriceActivity.activityId;
            }

            this.loading = false;
          },
          error: (err) => {
            console.warn(err);
            this.loading = false;
          },
        });
      },
      error: (err) => {
        console.error('failed loading venue', err);
        this.loading = false;
      },
    });
  }

  // image gallery helper
  selectedImage(index: number) {
    return this.venue?.venueImages?.[index] ?? null;
  }

  onSelectImage(index: number) {
    this.currentImageIndex = index;
  }

  // user changed start date via datepicker
  onStartDateChange(date?: Date | null) {
    this.startDateInvalid = false;
    this.formError = '';
    if (!date) {
      this.startDate = null;
      return;
    }
    const selected = this.normalizeDate(date);
    if (this.isBeforeDate(selected, this.minDate)) {
      // don't accept
      this.startDateInvalid = true;
      this.startDate = null;
      this.formError = 'Start date cannot be before today.';
      return;
    }
    this.startDate = selected;
    // if endDate is set, ensure end >= start
    if (this.endDate && this.isBeforeDate(this.normalizeDate(this.endDate), selected)) {
      this.formError = 'End date cannot be before start date.';
    } else {
      this.formError = '';
      this.endDateInvalid = false;
    }
  }

  // user changed end date via datepicker
  onEndDateChange(date?: Date | null) {
    this.endDateInvalid = false;
    this.formError = '';
    if (!date) {
      this.endDate = null;
      return;
    }
    const selected = this.normalizeDate(date);
    if (this.isBeforeDate(selected, this.minDate)) {
      // don't accept
      this.endDateInvalid = true;
      this.endDate = null;
      this.formError = 'End date cannot be before today.';
      return;
    }
    this.endDate = selected;
    // if startDate is set, ensure end >= start
    if (this.startDate && this.isBeforeDate(selected, this.normalizeDate(this.startDate))) {
      this.formError = 'End date cannot be before start date.';
    } else {
      this.formError = '';
      this.startDateInvalid = false;
    }
  }

  // helper: normalize a date to midnight (0:00) to compare by date only
  normalizeDate(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // returns true if a < b (both normalized)
  isBeforeDate(a: Date, b: Date) {
    return a.getTime() < b.getTime();
  }

  openAvailabilityModal() {
    if (!this.venue) return;

    // Basic validation before combining and opening modal
    this.formError = '';

    if (!this.startDate || !this.endDate) {
      this.formError = 'Both start and end date must be selected.';
      return;
    }
    // normalized comparisons
    const sNorm = this.normalizeDate(this.startDate);
    const eNorm = this.normalizeDate(this.endDate);

    if (this.isBeforeDate(sNorm, this.minDate) || this.isBeforeDate(eNorm, this.minDate)) {
      this.formError = 'Selected dates cannot be in the past.';
      return;
    }

    if (this.isBeforeDate(eNorm, sNorm)) {
      this.formError = 'End date cannot be before start date.';
      return;
    }

    // combine with times for precise datetimes
    const start = this.combineDateTime(this.startDate, this.startTime);
    const end = this.combineDateTime(this.endDate, this.endTime);
    if (!start || !end) {
      this.formError = 'Invalid start or end date/time.';
      return;
    }

    const activity = this.activities.find(a => a.activityId === this.selectedActivityId);

    // open availability modal
    const ref = this.dialog.open(AvailabilityModalComponent, {
      width: '800px',
      maxHeight: '85vh',
      data: {
        venueId: this.venue.venueId,
        venueName: this.venue.venueName,
        start, end,
        startTime: this.startTime,
        endTime: this.endTime,
        activityId: activity?.activityId,
        activityName: activity?.activityName
      }
    });

    ref.afterClosed().subscribe(result => {
      if (!result) return; // cancelled
      // result.mode === 'range' means fully available for the range
      // result.mode === 'single' means user selected a single date item and result.item is that item
      // open booking modal with the returned selection
      const bookingData = {
        ...result,
        venueId: this.venue.venueId,
        venueName: this.venue.venueName,
        activityId: activity?.activityId,
        activityName: activity?.activityName
      };
      this.dialog.open(BookingModalComponent, {
        width: '760px',
        maxHeight: '85vh',
        data: bookingData
      });
    });
  }


  combineDateTime(date?: Date | null, time?: string) {
    if (!date) return null;
    const [hh, mm] = (time || '00:00').split(':').map(Number);
    const d = new Date(date);
    d.setHours(hh, mm, 0, 0);
    return d;
  }
}
