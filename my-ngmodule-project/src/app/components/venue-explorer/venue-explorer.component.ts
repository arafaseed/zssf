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
  // startTime and endTime intentionally undefined so inputs are empty by default
  startTime: string | undefined = undefined;
  endDate!: Date | null;
  endTime: string | undefined = undefined;
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

  private toMinutes(time: string): number {
    const [hh, mm] = time.split(':').map(s => Number(s));
    return hh * 60 + mm;
  }

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

    // --- new helper: parse a time string into 24-hour parts ---
  private parseTimeString(time?: string | null): { hh: number; mm: number } | null {
    if (!time) return null;
    const t = time.trim();

    // 1) Match 12-hour with AM/PM like "7:00 AM" or "12:30 pm"
    const reAmpm = /^([0]?[1-9]|1[0-2]):([0-5][0-9])\s*([AaPp][Mm])$/;
    const m1 = t.match(reAmpm);
    if (m1) {
      let hh = parseInt(m1[1], 10);
      const mm = parseInt(m1[2], 10);
      const ampm = m1[3].toLowerCase();
      if (ampm === 'am') {
        if (hh === 12) hh = 0; // 12:xx AM -> 00:xx
      } else {
        if (hh !== 12) hh += 12; // 1pm..11pm -> 13..23
      }
      return { hh, mm };
    }

    // 2) Match 24-hour "HH:mm" or "H:mm"
    const re24 = /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
    const m2 = t.match(re24);
    if (m2) {
      const hh = parseInt(m2[1], 10);
      const mm = parseInt(m2[2], 10);
      return { hh, mm };
    }

    // Unknown format
    return null;
  }

  // --- new helper: format time the API expects ("HH:mm") ---
  private formatTimeForApi(time?: string | undefined | null): string | null {
    const parts = this.parseTimeString(time ?? '');
    if (!parts) return null;
    const hh = String(parts.hh).padStart(2, '0');
    const mm = String(parts.mm).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // --- updated combineDateTime: uses robust parse ---
  combineDateTime(date?: Date | null, time?: string | undefined) {
    if (!date) return null;
    // accept "7:00 AM", "07:00", "19:00", or null
    const parts = this.parseTimeString(time ?? '00:00');
    if (!parts) {
      // keep the previous behaviour of returning null on invalid times
      return null;
    }
    const d = new Date(date);
    d.setHours(parts.hh, parts.mm, 0, 0);
    return d;
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

    if (!this.startTime || !this.endTime) {
  this.formError = 'Please enter start and end times.';
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

    // format times for API (HH:mm)
    const apiStartTime = this.formatTimeForApi(this.startTime) ?? this.startTime ?? '00:00';
    const apiEndTime = this.formatTimeForApi(this.endTime) ?? this.endTime ?? '00:00';

    // open availability modal
    const ref = this.dialog.open(AvailabilityModalComponent, {
      width: '800px',
      maxHeight: '85vh',
      data: {
        venueId: this.venue.venueId,
        venueName: this.venue.venueName,
        start, end,
        // now we pass "HH:mm" strings to the modal/backend
        startTime: apiStartTime,
        endTime: apiEndTime,
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


  // combineDateTime(date?: Date | null, time?: string | undefined) {
  //   if (!date) return null;
  //   const [hh, mm] = (time ?? '00:00').split(':').map(Number);
  //   const d = new Date(date);
  //   d.setHours(hh, mm, 0, 0);
  //   return d;
  // }
}
