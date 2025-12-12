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
import { provideNativeDateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';


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
  // provide native date adapter so the material timepicker parses correctly
  providers: [provideNativeDateAdapter()],
})
export class VenueExplorerComponent implements OnInit {
[x: string]: any;
  venue: any = null;
  building: any = null;
  activities: any[] = [];
  optionalServices: any[] = [];
  minActivityPrice: number | null = null;
  loading = true;
  currentImageIndex = 0;
  venueStaff: any = null;


  // availability form model
  startDate!: Date | null;
  // startTime and endTime intentionally undefined so inputs are empty by default
  // they may be either string (legacy) or Date (mat-timepicker)
  startTime: string | Date | undefined = undefined;
  endDate!: Date | null;
  endTime: string | Date | undefined = undefined;
  selectedActivityId?: number;

  // date validation helpers
  minDate: Date = new Date(); 
  startDateInvalid = false;
  endDateInvalid = false;
  formError = '';

  constructor(
    private route: ActivatedRoute,
    private venueSvc: VenueService,
    private buildingSvc: BuildingService,
    private activitySvc: ActivityService,
    private optionalSvc: OptionalServiceService,
    private dialog: MatDialog,
    private translate: TranslateService
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

      // 🏢 Fetch building
      this.buildingSvc.getBuilding(v.buildingId).subscribe({
        next: (b) => (this.building = b),
        error: (err) => console.error('Failed to load building', err),
      });

        // 👩‍💼 Fetch staff assigned to the venue and filter out ADMIN
      this.venueSvc.getVenueStaff(v.venueId).subscribe({
        next: (staffList: any[]) => {
          console.log('Raw staff list:', staffList);
          this.venueStaff = staffList.filter(staff => {
            const roleStr = (typeof staff.role === 'string' ? staff.role : staff.role?.name || '').trim().toUpperCase();
            return roleStr !== 'ADMIN';
          });
          console.log('Filtered staff:', this.venueStaff);
        },
        error: (err) => {
          console.warn('No staff:', err);
          this.venueStaff = [];
        }
      });

      // ⚙️ Fetch activities and optional services in parallel
      const actObs =
        v.activityIds && v.activityIds.length
          ? forkJoin(v.activityIds.map((aid: number) => this.activitySvc.getActivityById(aid)))
          : of([]);

      const optObs =
        v.optionalServiceIds && v.optionalServiceIds.length
          ? forkJoin(v.optionalServiceIds.map((sid: number) => this.optionalSvc.getServiceById(sid)))
          : of([]);

      forkJoin([actObs, optObs]).subscribe({
        next: ([actsRaw, optsRaw]: any) => {
          // normalize and filter nulls
          this.activities = (actsRaw || []).filter(Boolean);
          this.optionalServices = (optsRaw || []).filter(Boolean);

          // 💰 compute min price
          const prices = this.activities.map((a: any) => Number(a.price)).filter((p) => !isNaN(p));
          this.minActivityPrice = prices.length ? Math.round(Math.min(...prices)) : null;

          this.loading = false;
        },
        error: (err) => {
          console.warn('⚠️ Failed to load activities or optional services', err);
          this.loading = false;
        },
      });
    },
    error: (err) => {
      console.error('❌ Failed loading venue', err);
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
      // this.formError = 'Start date cannot be before today.';
     this.formError = 'formErrors.startDateBeforeToday';


      return;
    }
    this.startDate = selected;
    // if endDate is set, ensure end >= start
    if (this.endDate && this.isBeforeDate(this.normalizeDate(this.endDate), selected)) {
       this.formError = 'formErrors.endDateBeforeStart';
    } else {
      this.formError = '';
      this.endDateInvalid = false;
    }

    // If the user changed startDate and it's today, optionally clear or validate startTime
    // We'll not auto-change time but show validation at submit; clear any previous formError
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
      // this.formError = 'End date cannot be before today.';
        this.formError = 'formErrors.endDateBeforeStart';
      return;
    }
    this.endDate = selected;
    // if startDate is set, ensure end >= start
    if (this.startDate && this.isBeforeDate(selected, this.normalizeDate(this.startDate))) {
      // this.formError = 'End date cannot be before start date.';
      this.formError = 'formErrors.endDateBeforeStart';
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

  /**
   * Parse a time value into { hh, mm }.
   * Accepts:
   *  - Date objects (e.g. from mat-timepicker)
   *  - strings in "7:00 AM", "07:00", "19:00", "7:00AM", "07:00:00" formats
   * Returns null on unknown/invalid formats.
   */
  private parseTimeString(time?: string | Date | null): { hh: number; mm: number } | null {
    if (!time && time !== '') return null;

    // If it's a Date-like object, extract hours/minutes
    if (time instanceof Date) {
      if (isNaN(time.getTime())) return null;
      return { hh: time.getHours(), mm: time.getMinutes() };
    }

    // Some libraries may pass objects that look like date but aren't instance of Date.
    if (typeof time === 'object' && time !== null) {
      // try common properties
      const anyT: any = time as any;
      if (typeof anyT.getHours === 'function' && typeof anyT.getMinutes === 'function') {
        try {
          const hh = anyT.getHours();
          const mm = anyT.getMinutes();
          if (Number.isFinite(hh) && Number.isFinite(mm)) return { hh, mm };
        } catch {
          // fall through to string parsing
        }
      }
    }

    // From here treat as string
    if (typeof time !== 'string') {
      // fallback: convert to string
      try {
        time = String(time);
      } catch {
        return null;
      }
    }

    const t = time.trim();

    if (!t) return null;

    // 1) Match 12-hour with AM/PM like "7:00 AM" or "12:30 pm" (allow optional spaces)
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

    // 2) Match 24-hour "HH:mm" or "H:mm", optional seconds (ignored)
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

  /**
   * Format a time (string or Date) to "HH:mm" for API.
   * Returns null when time cannot be parsed.
   */
  private formatTimeForApi(time?: string | Date | undefined | null): string | null {
    if (!time && time !== '') return null;
    // If Date
    if (time instanceof Date) {
      if (isNaN(time.getTime())) return null;
      const hh = String(time.getHours()).padStart(2, '0');
      const mm = String(time.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }

    // Otherwise rely on parseTimeString
    const parts = this.parseTimeString(time as any);
    if (!parts) return null;
    const hh = String(parts.hh).padStart(2, '0');
    const mm = String(parts.mm).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // --- combineDateTime: uses robust parse (handles Date or string time) ---
  combineDateTime(date?: Date | null, time?: string | Date | undefined) {
    if (!date) return null;
    const parts = this.parseTimeString(time ?? '00:00');
    if (!parts) {
      // keep the previous behaviour of returning null on invalid times
      return null;
    }
    const d = new Date(date);
    d.setHours(parts.hh, parts.mm, 0, 0);
    return d;
  }

  // --- NEW: time picker min values (bound by template) ---

  // Returns a "HH:mm" string used as matTimepickerMin for start input.
  get startTimePickerMin(): string {
    const baseMin = 6 * 60; // 06:00 in minutes
    const maxAllowed = 23 * 60 + 59; // 23:59
    // if startDate equals today, min is now + 60 minutes
    if (this.startDate) {
      const today = this.normalizeDate(new Date());
      const sNorm = this.normalizeDate(this.startDate);
      if (sNorm.getTime() === today.getTime()) {
        const now = new Date();
        const nowM = now.getHours() * 60 + now.getMinutes();
        let minCandidate = nowM + 60; // at least 1 hour ahead
        if (minCandidate > maxAllowed) minCandidate = maxAllowed;
        if (minCandidate < baseMin) minCandidate = baseMin;
        return this.minutesToHHMM(minCandidate);
      }
    }
    return this.minutesToHHMM(baseMin);
  }

  // Returns a "HH:mm" string used as matTimepickerMin for end input.
  // If startTime exists it will return startTime + 30 minutes (clamped), otherwise base start min + 30.
  get endTimePickerMin(): string {
    const maxAllowed = 23 * 60 + 59; // 23:59
    let startM: number | null = null;
    const parsedStart = this.parseTimeString(this.startTime as any);
    if (parsedStart) {
      startM = parsedStart.hh * 60 + parsedStart.mm;
    } else {
      // fallback to computed start min
      const startMinParts = this.parseTimeString(this.startTimePickerMin);
      if (startMinParts) startM = startMinParts.hh * 60 + startMinParts.mm;
    }
    if (startM === null) {
      // safe fallback to 06:30
      startM = 6 * 60 + 30;
    }
    let endMin = startM + 30; // at least 30 minutes after start
    if (endMin > maxAllowed) endMin = maxAllowed;
    return this.minutesToHHMM(endMin);
  }

  private minutesToHHMM(mins: number) {
    const hh = Math.floor(mins / 60);
    const mm = mins % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
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
      // this.formError = 'End date cannot be before start date.';
       this.formError = 'formErrors.endDateBeforeStart';
      return;
    }

    if (!this.startTime || !this.endTime) {
      this.formError = 'formErrors.bothDatesRequired';
      return;
    }

    // Additional time-range enforcement: ensure start/end fall into allowed window (06:00 - 23:59)
    const minAllowed = 6 * 60 + 0; // 06:00
    const maxAllowed = 23 * 60 + 59; // 23:59
    const parsedStart = this.parseTimeString(this.startTime as any);
    const parsedEnd = this.parseTimeString(this.endTime as any);

    if (!parsedStart || !parsedEnd) {
      this.formError = 'formErrors.invalidTimeFormat';
      return;
    }

    const startM = parsedStart.hh * 60 + parsedStart.mm;
    const endM = parsedEnd.hh * 60 + parsedEnd.mm;

    if (startM < minAllowed || startM > maxAllowed) {
      this.formError = 'Start time must be between 06:00 and 23:59.';
      return;
    }
    if (endM < minAllowed || endM > maxAllowed) {
      this.formError = 'End time must be between 06:00 and 23:59.';
      return;
    }

    // If startDate is today, ensure start time is at least current time + 1 hour
    const today = this.normalizeDate(new Date());
    if (this.startDate && this.normalizeDate(this.startDate).getTime() === today.getTime()) {
      const now = new Date();
      const nowM = now.getHours() * 60 + now.getMinutes();
      const requiredStart = nowM + 60; // at least +1 hour
      if (startM < requiredStart) {
        this.formError = 'For events starting today, start time must be at least 1 hour from now.';
        return;
      }
    }

    // Always require end time to be at least 30 minutes after start time
    if (endM < startM + 30) {
      this.formError = 'End time must be at least 30 minutes after start time.';
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
        activityName: activity?.activityName,
        activityPrice:activity?.price
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
        activityName: activity?.activityName,
        activityPrice: activity?.price
      };
      this.dialog.open(BookingModalComponent, {
        width: '760px',
        maxHeight: '85vh',
        data: bookingData
      });
    });
  }
}
