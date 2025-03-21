import { Component } from '@angular/core';
import { MultiStepFormService } from '../multi-step-form.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BookingService } from '../Services/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-multi-step-form',
  standalone: false,
  templateUrl: './multi-step-form.component.html',
  styleUrl: './multi-step-form.component.css'
})
export class MultiStepFormComponent {
  currentStep = 1;
  bookingForm: FormGroup;
  
  venueOptions: { venueId: number, venueName: string, capacity: number }[] = [];
  packageOptions: { leaseId: number, packageName: string }[] = [];
  venueId!: number;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private multiStepFormService: MultiStepFormService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.bookingForm = this.fb.group({
      venueId: ['', Validators.required],
      venuePackageId: ['', Validators.required],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required],
      fullName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]*$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      discountRate: [0]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const venueId = params['venueId'];
      if (venueId) {
        this.venueId = Number(venueId);
        this.bookingForm.patchValue({ venueId: this.venueId });
        this.loadLeases(this.venueId);
      }
    });

    this.loadVenues();
  }

  loadVenues(): void {
    this.multiStepFormService.getVenues().subscribe({
      next: (venues) => this.venueOptions = venues,
      error: (error) => console.error('Error loading venues:', error)
    });
  }

  loadLeases(venueId: number): void {
    this.multiStepFormService.getLeasesByVenue(venueId).subscribe({
      next: (leases) => this.packageOptions = leases,
      error: (error) => console.error('Error loading leases:', error)
    });
  }

  onVenueChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.bookingForm.patchValue({ venueId: Number(selectedValue) });
    this.loadLeases(Number(selectedValue));
  }

  onPackageChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.bookingForm.patchValue({ venuePackageId: Number(selectedValue) });
  }

  nextStep(): void {
    this.bookingForm.markAllAsTouched();
    console.log('Current form data:', this.bookingForm.value);
    this.currentStep++;
  }

  prevStep(): void {
    this.currentStep--;
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      return;
    }

    this.bookingService.createBooking(this.bookingForm.value).subscribe({
      next: (response) => {
        console.log('Booking created successfully', response);
        this.snackBar.open('Booking created successfully!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error creating booking', error);
        this.snackBar.open('Error creating booking. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
