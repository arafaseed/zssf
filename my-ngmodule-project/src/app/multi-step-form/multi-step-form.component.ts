import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  templateUrl: './multi-step-form.component.html',
  standalone: false,
  styleUrls: ['./multi-step-form.component.css']
})
export class MultiStepFormComponent implements OnInit, OnDestroy {
  sessionOptions = [
    { label: 'Session 1: Asubuhi- Mchana', start: '06:00', end: '13:00' },
    { label: 'Session 2: Alasiri- Usiku',  start: '14:00', end: '00:00' },
    { label: 'SIKU NZIMA:',                start: '06:00', end: '00:00' }
  ];
  selectedSessionTime: string | null = null;
  currentStep = 1;
  bookingForm: FormGroup;

  selectedVenueName = '';
  venueOptions: { venueId: number; venueName: string; capacity: number }[] = [];
  packageOptions: { leaseId: number; packageName: string; price: number }[] = [];
  venueId!: number;

  bookedDates: Date[] = [];
  private bookedDatesSet = new Set<string>(); // e.g. "2025-03-22"
  private fetchIntervalId: any;

  selectedStartDate: Date = new Date();
  selectedEndDate: Date | null = null;
  showEndDate = false;
  selectingEndDate = false;
  selectedDate: Date = new Date();


  // Base URL for booking-related endpoints
  private bookingApiUrl = 'http://localhost:8080/api/bookings';

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
    this.bookingForm = this.fb.group({
      venueId:          ['', Validators.required],
      venuePackageId:   ['', Validators.required],
      startDate:        ['', Validators.required],
      startTime:        ['', Validators.required],
      endDate:          [''],
      endTime:          ['', Validators.required],
      fullName:         ['', Validators.required],
      phoneNumber:      ['', [Validators.required, Validators.pattern('^\\+?[0-9]*$')]],
      email:            ['', [Validators.required, Validators.email]],
      address:          ['', Validators.required],
      discountRate:     [0],
      session:          ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // 1) Extract venueId from query parameters
    this.route.queryParams.subscribe(params => {
      const venueIdParam = params['venueId'];
      if (venueIdParam) {
        this.venueId = Number(venueIdParam);
        this.bookingForm.patchValue({ venueId: this.venueId });

        // Immediately fetch booked slots, then every 2 seconds
        this.fetchBookedSlots();
        this.fetchIntervalId = setInterval(() => {
          this.fetchBookedSlots();
        }, 2000);

        // Load leases tied to this venue
        this.loadLeases(this.venueId);
      }
    });

    // 2) Load all venues for the dropdown (and set selectedVenueName if already known)
    this.loadVenues();
  }

  ngOnDestroy(): void {
    if (this.fetchIntervalId) {
      clearInterval(this.fetchIntervalId);
    }
  }

  /** Fetch booked slots from backend and update bookedDates & bookedDatesSet */
  private fetchBookedSlots(): void {
    if (!this.venueId) return;

    this.http
      .get<BookedSlot[]>(`${this.bookingApiUrl}/venue/${this.venueId}/booked-slots`)
      .subscribe({
        next: (slots) => {
          // Reset arrays, then re-populate
          this.bookedDates = [];
          this.bookedDatesSet.clear();
          slots.forEach(slot => {
            // Only consider the date string (ignore startTime/endTime for disabling entire day)
            const iso = slot.date; // "YYYY-MM-DD"
            this.bookedDatesSet.add(iso);
            const d = new Date(iso + 'T00:00:00');
            this.bookedDates.push(d);
          });
        },
        error: (error) => console.error('Error fetching booked slots:', error)
      });
  }

  /** Load all venues, then set selectedVenueName if venueId already exists */
  private loadVenues(): void {
    this.multiStepFormService.getVenues().subscribe({
      next: (venues) => {
        this.venueOptions = venues;
        const found = venues.find(v => v.venueId === this.venueId);
        if (found) {
          this.selectedVenueName = found.venueName;
        }
      },
      error: (err) => console.error('Error loading venues:', err)
    });
  }

  /** Load leases/packages for a given venue */
  private loadLeases(venueId: number): void {
    this.multiStepFormService.getLeasesByVenue(venueId).subscribe({
      next: (leases) => this.packageOptions = leases,
      error: (err) => console.error('Error loading leases:', err)
    });
  }

  /**
   * Disable any date before today, or any date that appears in bookedDatesSet.
   * This still prevents selection, but styling is handled by dateClass().
   */
  dateFilter = (d: Date | null): boolean => {
    if (!d) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1) All dates < today are disabled
    const cell = new Date(d);
    cell.setHours(0, 0, 0, 0);
    if (cell < today) {
      return false;
    }

    // 2) Any date in bookedDatesSet is disabled
    const iso = cell.toISOString().split('T')[0];
    if (this.bookedDatesSet.has(iso)) {
      return false;
    }

    // Otherwise it is enabled
    return true;
  };

  dateClass = (cellDate: Date, view: string): string => {
  if (view !== 'month') {
    return '';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cell = new Date(cellDate);
  cell.setHours(0, 0, 0, 0);

  // 1) Past dates → gray  text
  if (cell < today) {
    return ' text-gray-400';
  }

  // 2) Booked dates → red  text
  const iso = cell.toISOString().split('T')[0]; // "YYYY-MM-DD"
  if (this.bookedDatesSet.has(iso)) {
    return 'text-red-500';
  }

  // 3) Available dates → green  text
  return 'text-green-700';
};

  /** When user clicks a date: show feedback if disabled, otherwise patch form. */
  onDateSelected(date: Date | null): void {
    if (!date) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cell = new Date(date);
    cell.setHours(0, 0, 0, 0);
    const iso = cell.toISOString().split('T')[0];

    // 1) If date < today → show snackBar
    if (cell < today) {
      this.snackBar.open('Cannot pick a past date.', 'Close', { duration: 3000 });
      return;
    }

    // 2) If date is in bookedDatesSet → show snackBar
    if (this.bookedDatesSet.has(iso)) {
      this.snackBar.open('This date is already booked. Please choose another.', 'Close', { duration: 3000 });
      return;
    }

    // 3) Otherwise accept it
    if (this.selectingEndDate && this.showEndDate) {
      this.selectedEndDate = date;
      this.bookingForm.patchValue({ endDate: date });
      this.selectingEndDate = false;
    } else {
      this.selectedStartDate = date;
      this.bookingForm.patchValue({ startDate: date });

      if (this.showEndDate) {
        this.bookingForm.patchValue({ endDate: null });
        this.selectedEndDate = null;
      }
    }
  }

  toggleEndDate(): void {
    this.showEndDate = !this.showEndDate;

    if (!this.showEndDate) {
      this.bookingForm.patchValue({ endDate: null });
      this.selectedEndDate = null;
    } else {
      this.selectingEndDate = true;
    }
  }

  nextStep(): void {
    // Prevent picking a past time on the chosen date
    const sd = this.bookingForm.value.startDate as Date;
    const st = this.bookingForm.value.startTime as string; // "HH:mm"
    if (sd && st) {
      const [hh, mm] = st.split(':').map(x => Number(x));
      const combined = new Date(sd);
      combined.setHours(hh, mm, 0, 0);
      if (combined < new Date()) {
        this.snackBar.open('You cannot pick a start time in the past.', 'Close', { duration: 3000 });
        return;
      }
    }

    // Validate required fields
    const requiredFields = ['venueId', 'venuePackageId', 'startDate', 'startTime', 'endTime'];
    let hasErrors = false;
    requiredFields.forEach(field => {
      const control = this.bookingForm.get(field);
      if (control && control.invalid) {
        control.markAsTouched();
        hasErrors = true;
      }
    });
    if (hasErrors) {
      this.snackBar.open('Please fill in all required fields before continuing.', 'Close', { duration: 3000 });
      return;
    }

    this.currentStep++;
  }

  prevStep(): void {
    this.currentStep--;
  }

  onSessionChange(): void {
    const selectedLabel = this.bookingForm.get('session')?.value;
    const session = this.sessionOptions.find(s => s.label === selectedLabel);
    if (session) {
      this.selectedSessionTime = `${session.start} – ${session.end}`;
      this.bookingForm.patchValue({
        startTime: session.start,
        endTime: session.end
      });
    }
  }

  onSubmit(): void {
    // Prevent booking at a date/time in the past again
    const sd = this.bookingForm.value.startDate as Date;
    const st = this.bookingForm.value.startTime as string;
    if (sd && st) {
      const [hh, mm] = st.split(':').map(x => Number(x));
      const combined = new Date(sd);
      combined.setHours(hh, mm, 0, 0);
      if (combined < new Date()) {
        this.snackBar.open('You cannot book for a date/time in the past.', 'Close', { duration: 3000 });
        return;
      }
    }

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    // Ensure correct session times
    const selectedSession = this.sessionOptions.find(
      s => s.label === this.bookingForm.value.session
    );
    if (selectedSession) {
      this.bookingForm.patchValue({
        startTime: selectedSession.start,
        endTime: selectedSession.end
      });
    }

    // Compute duration (in days) and price
    const startDate = new Date(this.bookingForm.value.startDate);
    const endDateRaw = this.bookingForm.value.endDate as Date | null;
    const endDate = endDateRaw ? new Date(endDateRaw) : startDate;
    const durationInDays =
      Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
    const selectedPackage = this.packageOptions.find(
      p => p.leaseId == this.bookingForm.value.venuePackageId
    );
    const pricePerDay = selectedPackage?.price || 0;
    const totalPrice = pricePerDay * durationInDays;

    // Confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        fullName: this.bookingForm.value.fullName,
        venue: this.selectedVenueName || 'N/A',
        packageName: selectedPackage?.packageName || 'N/A',
        price: totalPrice,
        durationInDays: durationInDays
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        // Create booking; assume response returns { bookingId: <number>, ... }
        this.bookingService.createBooking(this.bookingForm.value).subscribe({
          next: (resp: any) => {
            this.snackBar.open('Booking created successfully!', 'Close', { duration: 3000 });

            // Navigate to invoice page using returned bookingId
            const newBookingId = resp.bookingId;
            this.router.navigate(['/invoice', newBookingId]);
          },
          error: () => {
            this.snackBar.open('Booking failed. Please try again.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
