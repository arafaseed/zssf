import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BookingService } from '../Services/booking.service';
import { MultiStepFormService } from '../Services/multi-step-form.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { InvoiceServiceService } from '../Services/invoice-service.service';

@Component({
  selector: 'app-multi-step-form',
  templateUrl: './multi-step-form.component.html',
  standalone: false,
  styleUrls: ['./multi-step-form.component.css']
})
export class MultiStepFormComponent implements OnInit {
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
  selectedStartDate: Date = new Date();
  selectedEndDate: Date | null = null;
  showEndDate = false;
  selectingEndDate = false;
  selectedDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
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
    // 1) Subscribe to query parameters and extract venueId
    this.route.queryParams.subscribe(params => {
      const venueIdParam = params['venueId'];
      if (venueIdParam) {
        this.venueId = Number(venueIdParam);
        // Patch the form’s venueId field immediately
        this.bookingForm.patchValue({ venueId: this.venueId });
        // Load data that depends on venueId
        this.loadBookedDates();
        this.loadLeases(this.venueId);
      }
    });

    // 2) Load all venues (to populate dropdown & set selectedVenueName)
    this.loadVenues();
  }

  private loadBookedDates(): void {
    // Only call if venueId is set
    if (!this.venueId) {
      return;
    }
    this.bookingService.getBookedSlots(this.venueId).subscribe({
      next: (dates: string[]) => {
        this.bookedDates = dates.map(dateStr => new Date(dateStr));
      },
      error: (error) => console.error('Error loading booked dates:', error)
    });
  }

  minDate = new Date();

  private loadVenues(): void {
    this.multiStepFormService.getVenues().subscribe({
      next: (venues) => {
        this.venueOptions = venues;
        // If we already have a venueId (from queryParams), find its name
        const foundVenue = venues.find(v => v.venueId === this.venueId);
        if (foundVenue) {
          this.selectedVenueName = foundVenue.venueName;
        }
      },
      error: (error) => console.error('Error loading venues:', error)
    });
  }

  private loadLeases(venueId: number): void {
    this.multiStepFormService.getLeasesByVenue(venueId).subscribe({
      next: (leases) => this.packageOptions = leases,
      error: (error) => console.error('Error loading leases:', error)
    });
  }

  dateFilter = (d: Date | null): boolean => {
  if (!d) return false;
  const today = new Date();
  // zero out hours/minutes/seconds so compare just on date‐only
  today.setHours(0, 0, 0, 0);
  const day = d.getDay();
  // prevent  any date before today
  if (d < today) return false;
  // also block if already booked
  const iso = d.toISOString().split('T')[0];
  return !this.bookedDates.some(bd => bd.toISOString().split('T')[0] === iso);
};

  onPackageChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.bookingForm.patchValue({ venuePackageId: Number(selectedValue) });
  }

  nextStep(): void {
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
      this.snackBar.open('Please fill in all required fields before continuing.', 'Close', {
        duration: 3000,
      });
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

    // Re‐patch times from session for safety
    const selectedSession = this.sessionOptions.find(
      s => s.label === this.bookingForm.value.session
    );
    if (selectedSession) {
      this.bookingForm.patchValue({
        startTime: selectedSession.start,
        endTime: selectedSession.end
      });
    }

    // Compute duration (in days)
    const startDate = new Date(this.bookingForm.value.startDate);
    const endDate = this.bookingForm.value.endDate 
      ? new Date(this.bookingForm.value.endDate) 
      : startDate;

    const durationInDays =
      Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;

    // Find package price and total
    const selectedPackage = this.packageOptions.find(
      p => p.leaseId == this.bookingForm.value.venuePackageId
    );
    const pricePerDay = selectedPackage?.price || 0;
    const totalPrice = pricePerDay * durationInDays;

    // Show confirmation dialog
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
        this.bookingService.createBooking(this.bookingForm.value).subscribe({
          next: () => {
            this.snackBar.open('Booking created successfully!', 'Close', { duration: 3000 });

            const invoiceData = {
              invoiceNumber: 'INV' + new Date().getTime(),
              customerName: this.bookingForm.value.fullName,
              customerEmail: this.bookingForm.value.email,
              amount: totalPrice,
              paymentType: 'Credit Card'
            };
            this.invoiceService.setInvoiceData(invoiceData);
            this.router.navigate(['/invoice']);
          },
          error: () => {
            this.snackBar.open('Booking failed. Please try again.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  onDateSelected(date: Date | null): void {
    if (!date) return;

    if (this.selectingEndDate && this.showEndDate) {
      this.selectedEndDate = date;
      this.bookingForm.patchValue({ endDate: date });
      this.selectingEndDate = false;
    } else {
      this.selectedStartDate = date;
      this.bookingForm.patchValue({ startDate: date });
      // If end‐date mode is on, clear previous end date
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
}
