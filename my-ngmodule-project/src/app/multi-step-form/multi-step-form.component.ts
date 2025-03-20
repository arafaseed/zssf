import { Component } from '@angular/core';
import { MultiStepFormService } from '../multi-step-form.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BookingService } from '../Services/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-multi-step-form',
  standalone: false,
  templateUrl: './multi-step-form.component.html',
  styleUrl: './multi-step-form.component.css'
})
export class MultiStepFormComponent {
  currentStep = 1;
  bookingForm: FormGroup;
  venueOptions: { venueId: number, venueName: string }[] = [];
  packageOptions: { leaseId: number, packageName: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private multiStepFormService: MultiStepFormService,
    private snackBar: MatSnackBar
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
      discountRate: [0]  // Add discountRate field
    });
  }

  ngOnInit(): void {
    this.loadVenues();
    this.loadPackages();
  }

  loadVenues() {
    this.multiStepFormService.getVenues().subscribe(
      (venues) => {
        this.venueOptions = venues;
      },
      (error) => {
        console.error('Error loading venues:', error);
      }
    );
  }

  loadPackages() {
    this.multiStepFormService.getPackages().subscribe(
      (packages) => {
        this.packageOptions = packages;
      },
      (error) => {
        console.error('Error loading packages:', error);
      }
    );
  }

  nextStep() {
    
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  onSubmit() {
    if (this.bookingForm.invalid) {
      return;
    }

    console.log('Booking Form Data:', this.bookingForm.value);  // Log form data

    this.bookingService.createBooking(this.bookingForm.value).subscribe(
      response => {
        console.log('Booking created successfully', response);
        // Show success toast
        this.snackBar.open('Booking created successfully!', 'Close', {
          duration: 3000,  // 3 seconds
          panelClass: ['success-snackbar']  // Optional: Define custom class for styling
        });
      },
      error => {
        console.error('Error creating booking', error);
        // Show error toast
        this.snackBar.open('Error creating booking. Please try again.', 'Close', {
          duration: 3000,  // 3 seconds
          panelClass: ['error-snackbar']  // Optional: Define custom class for styling
        });
      }
    );
  }
}