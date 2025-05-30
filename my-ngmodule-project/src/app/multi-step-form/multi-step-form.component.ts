import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

import { BookingService } from '../Services/booking.service';
import { MultiStepFormService } from '../Services/multi-step-form.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { InvoiceServiceService } from '../Services/invoice-service.service';

interface BookedSlot {
  date: string;        // e.g. "2025-03-22"
  startTime: string;   // e.g. "08:00:00"
  endTime?: string;
}

@Component({
  selector: 'app-multi-step-form',
  standalone: false,
  templateUrl: './multi-step-form.component.html',
  styleUrls: ['./multi-step-form.component.css']
})
export class MultiStepFormComponent implements OnInit, OnDestroy {
  sessionOptions = [
    // Only one option—SIKU NZIMA—preselected
    { label: 'SIKU NZIMA', start: '06:00', end: '00:00' }
  ];
  selectedSessionTime: string | null = '06:00 – 00:00';
  currentStep = 1;
  bookingForm: FormGroup;

  selectedVenueName = '';
  venueOptions: { venueId: number; venueName: string; capacity: number }[] = [];
  packageOptions: { leaseId: number; packageName: string; price: number }[] = [];
  venueId!: number;

  bookedDatesSet = new Set<string>(); // stores YYYY-MM-DD for booked days
  private fetchIntervalId: any;

  // Base URL for booking-related endpoints
  private bookingApiUrl = 'http://localhost:8080/api/bookings';

  // Today's date for datePicker.min
  minDate = new Date();

  onDateChange(
  event: { value: Date | null },
  which: 'start' | 'end'
): void {
  const selected: Date | null = event.value;
  if (!selected) {
    return;
  }

  // Create a midnight‐normalized copy
  const cell = new Date(selected);
  cell.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const iso = cell.toISOString().split('T')[0];
  if (cell < today) {
    this.snackBar.open('Cannot pick a past date.', 'Close', { duration: 3000 });
    // Revert: clear whichever control was clicked
    if (which === 'start') {
      (this.bookingForm.get('dateRangeGroup.startDate') as FormControl).reset();
    } else {
      (this.bookingForm.get('dateRangeGroup.endDate') as FormControl).reset();
    }
    return;
  }
  if (this.bookedDatesSet.has(iso)) {
    this.snackBar.open(
      'This date is already booked. Please choose another.',
      'Close',
      { duration: 3000 }
    );
    if (which === 'start') {
      (this.bookingForm.get('dateRangeGroup.startDate') as FormControl).reset();
    } else {
      (this.bookingForm.get('dateRangeGroup.endDate') as FormControl).reset();
    }
    return;
  }

  // Otherwise accept it—no additional action needed (the form value is already set)
}

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private bookingService: BookingService,
    private multiStepFormService: MultiStepFormService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private invoiceService: InvoiceServiceService
  ) {
    // Build the form
    this.bookingForm = this.fb.group({
      // Group for date range: startDate and endDate
      dateRangeGroup: this.fb.group({
        startDate: ['', Validators.required],
        endDate: [''] // optional; we’ll treat same‐as‐start if blank
      }),
      venueId: ['', Validators.required],
      venuePackageId: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      session: ['SIKU NZIMA', Validators.required], // preselect
      fullName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^\\+?[0-9]*$')]
      ],
      email: ['', [Validators.email]], // no longer required
      address: ['', Validators.required],
      discountRate: [0]
    });

    // Ensure default times are set, so validation won't fail:
    this.bookingForm.patchValue({
      startTime: '06:00',
      endTime: '00:00'
    });
  }

  ngOnInit(): void {
    // 1) Read venueId from query params
    this.route.queryParams.subscribe((params) => {
      const vid = params['venueId'];
      if (vid) {
        this.venueId = Number(vid);
        this.bookingForm.patchValue({ venueId: this.venueId });

        // Start polling booked slots
        this.fetchBookedSlots();
        this.fetchIntervalId = setInterval(() => this.fetchBookedSlots(), 2000);

        // Load packages (leases) for this venue
        this.loadLeases(this.venueId);
      }
    });

    // 2) Load all venues (for drop-down and display name)
    this.loadVenues();
  }

  ngOnDestroy(): void {
    if (this.fetchIntervalId) {
      clearInterval(this.fetchIntervalId);
    }
  }

  /** Fetch booked slots every 2 seconds and populate bookedDatesSet */
  private fetchBookedSlots(): void {
    if (!this.venueId) return;
    this.http
      .get<BookedSlot[]>(`${this.bookingApiUrl}/venue/${this.venueId}/booked-slots`)
      .subscribe({
        next: (slots) => {
          this.bookedDatesSet.clear();
          slots.forEach((slot) => {
            const iso = slot.date; // “YYYY-MM-DD”
            this.bookedDatesSet.add(iso);
          });
        },
        error: (error) => console.error('Error fetching booked slots:', error)
      });
  }

  /** Load all venues to populate drop-down & set selectedVenueName */
  private loadVenues(): void {
    this.multiStepFormService.getVenues().subscribe({
      next: (venues) => {
        this.venueOptions = venues;
        const found = venues.find((v) => v.venueId === this.venueId);
        if (found) {
          this.selectedVenueName = found.venueName;
        }
      },
      error: (err) => console.error('Error loading venues:', err)
    });
  }

  /** Load packages (leases) for the chosen venue */
  private loadLeases(venueId: number): void {
    this.multiStepFormService.getLeasesByVenue(venueId).subscribe({
      next: (leases) => (this.packageOptions = leases),
      error: (err) => console.error('Error loading leases:', err)
    });
  }

  /**
   * dateFilter disables any date that is:
   *  - Before today
   *  - Already in bookedDatesSet
   */
  dateFilter = (d: Date | null): boolean => {
    if (!d) return false;
    const cell = new Date(d);
    cell.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (cell <= today) {
      return false;
    }
    const iso = cell.toISOString().split('T')[0]; // "YYYY-MM-DD"
    if (this.bookedDatesSet.has(iso)) {
      return false;
    }
    return true;
  };

  /**
   * dateClass applies custom CSS classes to each date cell:
   *  - Past or today → gray and unselectable
   *  - Booked → red and unselectable
   *  - Available → green
   */
  dateClass = (cellDate: Date, view: string): string => {
    if (view !== 'month') {
      return '';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cell = new Date(cellDate);
    cell.setHours(0, 0, 0, 0);
    const iso = cell.toISOString().split('T')[0];

    // Past or today → gray
    if (cell <= today) {
      return 'bg-gray-200 text-gray-600';
    }

    // Booked dates → red
    if (this.bookedDatesSet.has(iso)) {
      return 'bg-red-200 text-red-800';
    }

    // Available → green
    return 'bg-green-200 text-green-800';
  };

  /** Returns how many days are selected in the range (inclusive). */
  getDurationDays(): number {
    const drGroup = this.bookingForm.get('dateRangeGroup') as FormGroup;
    const start: Date = drGroup.get('startDate')!.value;
    let end: Date = drGroup.get('endDate')!.value;

    if (!start) return 0;
    if (!end) {
      // If no endDate chosen, treat as single‐day booking
      end = start;
    }
    const msPerDay = 1000 * 3600 * 24;
    const diff =
      Math.floor((new Date(end).getTime() - new Date(start).getTime()) / msPerDay) + 1;
    return diff > 0 ? diff : 1;
  }

  /** Move to next step after validating Step 1 fields. */
  nextStep(): void {
    const drGroup = this.bookingForm.get('dateRangeGroup') as FormGroup;
    const startDate: Date = drGroup.get('startDate')!.value;
    let endDate: Date = drGroup.get('endDate')!.value || startDate;

    // 1) Prevent selecting a start date earlier than the current time:
    const stTime: string = this.bookingForm.value.startTime;
    if (startDate && stTime) {
      const [hh, mm] = stTime.split(':').map((x) => Number(x));
      const combined = new Date(startDate);
      combined.setHours(hh, mm, 0, 0);
      if (combined < new Date()) {
        this.snackBar.open('Oops!Cannot pick a start day or time in the past.', 'Close', {
          duration: 3000
        });
        return;
      }
    }

    // 2) Validate Step 1 required fields
    const requiredFields = [
      'dateRangeGroup.startDate',
      'venueId',
      'venuePackageId',
      'startTime',
      'endTime',
      'session'
    ];
    let hasErr = false;
    requiredFields.forEach((path) => {
      const ctrl = this.bookingForm.get(path);
      if (ctrl && ctrl.invalid) {
        ctrl.markAsTouched();
        hasErr = true;
      }
    });
    if (hasErr) {
      this.snackBar.open('Please fill all required fields in Step 1.', 'Close', {
        duration: 3000
      });
      return;
    }

    this.currentStep++;
  }

  prevStep(): void {
    this.currentStep--;
  }

  /** If session changes (only one option anyway), update start/end times */
  onSessionChange(): void {
    const sessLabel = this.bookingForm.get('session')!.value;
    const sess = this.sessionOptions.find((s) => s.label === sessLabel);
    if (sess) {
      this.selectedSessionTime = `${sess.start} – ${sess.end}`;
      this.bookingForm.patchValue({
        startTime: sess.start,
        endTime: sess.end
      });
    }
  }

  onSubmit(): void {
    // 1) Prevent booking for date/time in the past once more
    const drGroup = this.bookingForm.get('dateRangeGroup') as FormGroup;
    const startDate: Date = drGroup.get('startDate')!.value;
    let endDate: Date = drGroup.get('endDate')!.value || startDate;
    const stTime: string = this.bookingForm.value.startTime;

    if (startDate && stTime) {
      const [hh, mm] = stTime.split(':').map((x) => Number(x));
      const combined = new Date(startDate);
      combined.setHours(hh, mm, 0, 0);
      if (combined < new Date()) {
        this.snackBar.open('Cannot book for a date/time in the past.', 'Close', {
          duration: 3000
        });
        return;
      }
    }

    // 2) Final form validation
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    // 3) Ensure the session times are re-patched
    const sessLabel = this.bookingForm.value.session;
    const sess = this.sessionOptions.find((s) => s.label === sessLabel);
    if (sess) {
      this.bookingForm.patchValue({
        startTime: sess.start,
        endTime: sess.end
      });
    }

    // 4) Calculate duration & total price
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    const msPerDay = 1000 * 3600 * 24;
    const durationInDays =
      Math.floor((ed.getTime() - sd.getTime()) / msPerDay) + 1;
    const selectedPkg = this.packageOptions.find(
      (p) => p.leaseId === this.bookingForm.value.venuePackageId
    );
    const pricePerDay = selectedPkg?.price || 0;
    const totalPrice = pricePerDay * durationInDays;

    // 5) Open confirmation dialog
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  data: {
    fullName: this.bookingForm.value.fullName,
    phoneNumber: this.bookingForm.value.phoneNumber,
    venue: this.selectedVenueName || 'N/A',
    packageName: selectedPkg?.packageName || 'N/A',
    price: totalPrice,
    startDate: this.bookingForm.value.dateRangeGroup.startDate,
    endDate: this.bookingForm.value.dateRangeGroup.endDate || this.bookingForm.value.dateRangeGroup.startDate,
    durationInDays: this.getDurationDays()
  }
});



    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }
      // 6) Create the booking via BookingService
      const payload = {
        venueId: this.bookingForm.value.venueId,
        venuePackageId: this.bookingForm.value.venuePackageId,
        startDate: this.bookingForm.value.dateRangeGroup.startDate,
        startTime: this.bookingForm.value.startTime,
        endDate:
          this.bookingForm.value.dateRangeGroup.endDate ||
          this.bookingForm.value.dateRangeGroup.startDate,
        endTime: this.bookingForm.value.endTime,
        fullName: this.bookingForm.value.fullName,
        phoneNumber: this.bookingForm.value.phoneNumber,
        email: this.bookingForm.value.email,
        address: this.bookingForm.value.address,
        discountRate: this.bookingForm.value.discountRate,
        session: this.bookingForm.value.session
      };

      this.bookingService.createBooking(payload).subscribe({
        next: (resp: any) => {
          this.snackBar.open('Booking created successfully!', 'Close', {
            duration: 3000
          });
          // Navigate to invoice page, passing new bookingId
          const newBookingId = resp.bookingId;
          this.router.navigate(['/invoice', newBookingId]);
        },
        error: () => {
          this.snackBar.open('Booking failed. Please try again.', 'Close', {
            duration: 3000
          });
        }
      });
    });
  }
}
