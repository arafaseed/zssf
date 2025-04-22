
import { MultiStepFormService } from '../multi-step-form.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BookingService } from '../Services/booking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core'; // Make sure this is imported
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceServiceService } from '../Services/invoice-service.service';


@Component({
  selector: 'app-multi-step-form',
  standalone: false,
  templateUrl: './multi-step-form.component.html',
  styleUrl: './multi-step-form.component.css'
})
export class MultiStepFormComponent implements OnInit{
  currentStep = 1;
  bookingForm: FormGroup;
  selectedVenueName: string = '';  
  venueOptions: { venueId: number, venueName: string, capacity: number }[] = [];
  packageOptions: {
    price: any; leaseId: number, packageName: string 
}[] = [];
  venueId!: number;
  // invoiceService: any;
  //  dialog: any;
  

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private multiStepFormService: MultiStepFormService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
   private router: Router, // ✅ Proper injection
     // ✅ Assuming you have a service
  private dialog: MatDialog,
  private invoiceService: InvoiceServiceService,
  
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
  
    this.loadVenues(); // load venues first
  }
  

  loadVenues(): void {
    this.multiStepFormService.getVenues().subscribe({
      next: (venues) => {
        this.venueOptions = venues;
  
        // After venues are loaded, find and set the selected venue name
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

  // 
  onSubmit(): void {
    // Open the confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        fullName: this.bookingForm.value.fullName,
        venue: this.selectedVenueName || 'N/A',
        packageName: this.packageOptions.find(p => p.leaseId == this.bookingForm.value.venuePackageId)?.packageName || 'N/A',
        price: this.packageOptions.find(p => p.leaseId == this.bookingForm.value.venuePackageId)?.price || 'N/A'
      }
    });
  
    // Wait for the result of the dialog
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // User confirmed, proceed with booking
        this.bookingService.createBooking(this.bookingForm.value).subscribe({
          next: (response) => {
            console.log('Booking created successfully', response);
            this.snackBar.open('Booking created successfully!', 'Close', { duration: 3000 });
 
            // Prepare invoice data
            const selectedVenue = this.venueOptions.find(v => v.venueId == this.bookingForm.value.venueId);
            const selectedPackage = this.packageOptions.find(p => p.leaseId == this.bookingForm.value.venuePackageId);
            console.log("hi");
            const invoiceData = {
              invoiceNumber: 'INV' + new Date().getTime(),
              date: new Date().toLocaleDateString(),
              customerName: this.bookingForm.value.fullName,
              customerEmail: this.bookingForm.value.email,
              customerPhone: this.bookingForm.value.phoneNumber,
              venue: selectedVenue ? selectedVenue.venueName : 'N/A',
              eventDate: this.bookingForm.value.startDate,
              amount: selectedPackage ? selectedPackage.price : 500, // Replace with actual price logic
              paymentType: 'Credit Card'
            };
  
            // Store invoice in service before navigation
            this.invoiceService.setInvoiceData(invoiceData);
  
            // Navigate to invoice page
            this.router.navigate(['/invoice']);
            
          },
          error: (error) => {
            console.error('Error creating booking:', error);
            this.snackBar.open('Booking failed. Please try again.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
  
  
      
}
