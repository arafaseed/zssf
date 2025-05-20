import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { BookingService } from '../Services/booking.service';
import { MultiStepFormService } from '../multi-step-form.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { InvoiceServiceService } from '../Services/invoice-service.service';

@Component({
  selector: 'app-multi-step-form',
  templateUrl: './multi-step-form.component.html',
  styleUrls: ['./multi-step-form.component.css'],
  standalone: false
})
export class MultiStepFormComponent implements OnInit {
  sessionOptions = [
    { label: 'Session 1: 12:00 AM – 1:00 PM', start: '00:00', end: '13:00' },
    { label: 'Session 2: 2:00 PM – 6:00 AM', start: '14:00', end: '06:00' }
  ];

  selectedSessionTime: string | null = null;
  currentStep = 1;
  bookingForm: FormGroup;
  selectedVenueName = '';
  venueOptions: { venueId: number; venueName: string; capacity: number }[] = [];
  packageOptions: { leaseId: number; packageName: string; price: number }[] = [];

  venueId?: number;
  selectedDate: Date | null = null;
  selectedStartDate: Date = new Date();
  selectedEndDate: Date | null = null;
  showEndDate = false;
  selectingEndDate = false;
invoiceData: any;

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
      venueId: ['', Validators.required],
      venuePackageId: ['', Validators.required],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: [''],
      endTime: ['', Validators.required],
      fullName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]*$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      discountRate: [0],
      session: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const venueId = +params['venueId'];
      if (venueId) {
        this.venueId = venueId;
        this.bookingForm.patchValue({ venueId });
        this.loadLeases(venueId);
      }
    });
    this.loadVenues();
  }

  loadVenues(): void {
    this.multiStepFormService.getVenues().subscribe({
      next: (venues) => {
        this.venueOptions = venues;
        const selected = venues.find(v => v.venueId === this.venueId);
        this.selectedVenueName = selected?.venueName ?? '';
      },
      error: (err) => console.error('Failed to load venues:', err)
    });
  }

  loadLeases(venueId: number): void {
    this.multiStepFormService.getLeasesByVenue(venueId).subscribe({
      next: (leases) => this.packageOptions = leases,
      error: (err) => console.error('Failed to load packages:', err)
    });
  }

  dateFilter = (date: Date | null): boolean => {
    return date ? date.getDay() !== 1 : false; // disable Mondays
  };

  onPackageChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.bookingForm.patchValue({ venuePackageId: +value });
  }

  nextStep(): void {
    const required = ['venueId', 'venuePackageId', 'startDate', 'startTime', 'endTime'];
    let hasErrors = false;

    required.forEach(field => {
      const control = this.bookingForm.get(field);
      if (control?.invalid) {
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
    if (this.currentStep > 1) this.currentStep--;
  }

  onSessionChange(): void {
    const selectedLabel = this.bookingForm.value.session;
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
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const selectedSession = this.sessionOptions.find(
      s => s.label === this.bookingForm.value.session
    );
    if (selectedSession) {
      this.bookingForm.patchValue({
        startTime: selectedSession.start,
        endTime: selectedSession.end
      });
    }

    const startDate = new Date(this.bookingForm.value.startDate);
    const endDateRaw = this.bookingForm.value.endDate;
    const endDate = endDateRaw ? new Date(endDateRaw) : startDate;
    const validEndDate = endDate >= startDate ? endDate : startDate;
    const durationInDays = Math.floor((validEndDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;

    const selectedPackage = this.packageOptions.find(
      p => p.leaseId === this.bookingForm.value.venuePackageId
    );
    const pricePerDay = selectedPackage?.price || 0;
    const totalPrice = pricePerDay * durationInDays;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        fullName: this.bookingForm.value.fullName,
        venue: this.selectedVenueName || 'N/A',
        packageName: selectedPackage?.packageName || 'N/A',
        price: totalPrice,
        durationInDays
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
     this.bookingService.createBooking(this.bookingForm.value).subscribe({
  next: (response) => { // ✅ This defines 'response'
    console.log('Booking response:', response); // Optional for debugging
    this.snackBar.open('Booking created successfully!', 'Close', { duration: 3000 });

    const bookingId = response.bookingId; // ✅ Change this based on your actual API

    const invoiceData = {
      invoiceNumber: 'INV' + new Date().getTime(),
      customerName: this.bookingForm.value.fullName,
      customerEmail: this.bookingForm.value.email,
      phone: this.bookingForm.value.phoneNumber,
      amount: totalPrice,
      paymentType: 'Credit Card'
    };

    this.invoiceService.setInvoiceData(invoiceData);
    this.router.navigate(['/invoice', bookingId]);
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
      this.selectingEndDate = false;
    } else {
      this.selectingEndDate = true;
    }
  }

  onDateChange(date: Date): void {
    this.selectedDate = date;
  }

  dateClass = (d: Date): string => {
    const date = d.getDate();
    return (date === 1 || date === 10 || date === 20) ? 'highlight-date' : '';
  };
}
