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
  standalone: false,
  styleUrls: ['./multi-step-form.component.css']
})
export class MultiStepFormComponent implements OnInit {
  currentStep = 1;
  bookingForm: FormGroup;
  selectedVenueName = '';
  venueOptions: { venueId: number; venueName: string; capacity: number }[] = [];
  packageOptions: { leaseId: number; packageName: string; price: number }[] = [];
  venueId!: number;

  selectedStartDate: Date = new Date();
  selectedEndDate: Date | null = null;
  showEndDate = false;
  selectingEndDate = false; // 👈 New flag
  selectedDate: Date = new Date(); // 👈 Re-add this


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
      next: (venues) => {
        this.venueOptions = venues;
        const foundVenue = venues.find(v => v.venueId === this.venueId);
        if (foundVenue) {
          this.selectedVenueName = foundVenue.venueName;
        }
      },
      error: (error) => console.error('Error loading venues:', error)
    });
  }

  loadLeases(venueId: number): void {
    this.multiStepFormService.getLeasesByVenue(venueId).subscribe({
      next: (leases) => this.packageOptions = leases,
      error: (error) => console.error('Error loading leases:', error)
    });
  }

  dateFilter = (date: Date | null): boolean => {
    const day = (date || new Date()).getDay();
    return day !== 1 && day !== 8;
  };

  onPackageChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.bookingForm.patchValue({ venuePackageId: Number(selectedValue) });
  }

  nextStep(): void {
    // if (this.bookingForm.invalid) {
    //    this.bookingForm.markAllAsTouched();
    //   return;
    // }
    this.currentStep++;
    console.log('Current step is now:', this.currentStep);
  }
  

  prevStep(): void {
    this.currentStep--;
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        fullName: this.bookingForm.value.fullName,
        venue: this.selectedVenueName || 'N/A',
        packageName:
          this.packageOptions.find(p => p.leaseId == this.bookingForm.value.venuePackageId)?.packageName || 'N/A',
        price: this.packageOptions.find(p => p.leaseId == this.bookingForm.value.venuePackageId)?.price || 'N/A'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.bookingService.createBooking(this.bookingForm.value).subscribe({
          next: () => {
            this.snackBar.open('Booking created successfully!', 'Close', { duration: 3000 });

            const invoiceData = {
              invoiceNumber: 'INV' + new Date().getTime(),
              customerName: this.bookingForm.value.fullName,
              customerEmail: this.bookingForm.value.email,
              amount: this.packageOptions.find(p => p.leaseId == this.bookingForm.value.venuePackageId)?.price || 500,
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

  // Updated date selection logic
  onDateSelected(date: Date | null): void {
    if (!date) return;

    if (this.selectingEndDate && this.showEndDate) {
      this.selectedEndDate = date;
      this.bookingForm.patchValue({ endDate: date });
      this.selectingEndDate = false;
    } else {
      this.selectedStartDate = date;
      this.bookingForm.patchValue({ startDate: date });

      // Optionally reset end date if start date changes
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
      this.selectingEndDate = true; // 👈 Now allow user to select end date from calendar
    }
  }
}
