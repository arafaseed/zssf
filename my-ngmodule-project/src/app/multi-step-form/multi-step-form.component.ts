import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { BookingService } from '../Services/booking.service';
import { MultiStepFormService } from '../Services/multi-step-form.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-multi-step-form',
  standalone:false,
  templateUrl: './multi-step-form.component.html',
  styleUrls: ['./multi-step-form.component.css']
})
export class MultiStepFormComponent implements OnInit, OnDestroy {
  bookingForm: FormGroup;
  currentStep = 1;
  minDate = new Date();

  selectedVenueName = '';
  venueOptions: any[] = [];
  packageOptions: any[] = [];
  activityOptions: any[] = [];

  sessionOptions = [
    { label: 'SIKU NZIMA', start: '06:00', end: '00:00' }
  ];

  private venueId!: number;
  private pollId: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private msForm: MultiStepFormService,
    private bookingService: BookingService
  ) {
    this.bookingForm = this.fb.group({
      startDate: ['', Validators.required],
      daysCount: [1, [Validators.required, Validators.min(1)]],
      endDate: [{ value: '', disabled: true }],

      venueId: ['', Validators.required],
      venuePackageId: ['', Validators.required],
      venueActivityId: ['', Validators.required],
      session: ['SIKU NZIMA', Validators.required],

      fullName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]*$')]],
      email: ['', [Validators.email]],
      address: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['venueId']) {
        this.venueId = +params['venueId'];
        this.bookingForm.patchValue({ venueId: this.venueId });
        this.loadVenueDetails(this.venueId);
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.pollId);
  }

  private loadVenueDetails(vid: number) {
    // Fetch name, packages & activities
    this.msForm.getVenues().subscribe(v => {
      const found = v.find(x => x.venueId === vid);
      if (found) this.selectedVenueName = found.venueName;
    });
    this.msForm.getLeasesByVenue(vid).subscribe(pk => this.packageOptions = pk);
    this.msForm.getActivitiesByVenue(vid).subscribe(act => this.activityOptions = act);

    // Optionally poll for booked slots if you disable dates later…
  }

 calculateEndDate() {
  const start: Date = this.bookingForm.value.startDate;
  const days: number = this.bookingForm.value.daysCount;

  if (!start) return;

  // If daysCount is invalid or less than 1, default to 1 day
  const validDays = days && days >= 1 ? days : 1;

  const ctrl = new Date(start);
  ctrl.setDate(ctrl.getDate() + (validDays - 1));

  this.bookingForm.get('endDate')!.setValue(ctrl);
}



  nextStep() {
  // mark the Step‑1 fields as touched:
  ['startDate','daysCount','venuePackageId','venueActivityId','session']
    .forEach(ctrlName => this.bookingForm.get(ctrlName)!.markAsTouched());

  // now if any are invalid, bail out and let mat‑error appear
  if (this.bookingForm.get('startDate')!.invalid ||
      this.bookingForm.get('daysCount')!.invalid ||
      this.bookingForm.get('venuePackageId')!.invalid ||
      this.bookingForm.get('venueActivityId')!.invalid ||
      this.bookingForm.get('session')!.invalid) {
    this.snackBar.open('Please fill all Step 1 fields first.', 'Close', { duration: 3000 });
    return;
  }
  this.currentStep = 2;
}


  prevStep() {
    this.currentStep = 1;
  }

  onSubmit() {
  // 1) Mark Step 2 fields as touched so errors show up
  ['fullName','phoneNumber','address']
    .forEach(ctrl => this.bookingForm.get(ctrl)!.markAsTouched());

  // 2) If any required Step 2 field is invalid, stop and show a snackbar
  if (this.bookingForm.get('fullName')!.invalid ||
      this.bookingForm.get('phoneNumber')!.invalid ||
      this.bookingForm.get('address')!.invalid) {
    this.snackBar.open('Please fill required Step 2 fields first.', 'Close', { duration: 3000 });
    return;
  }

  // 3) Gather the values we need for the confirmation dialog:
  const daysCount = this.bookingForm.value.daysCount;
  const startDate: Date = this.bookingForm.value.startDate;
  const endDate: Date  = this.bookingForm.value.endDate;
  
  // Find package & activity objects from the lists
  const selectedPkg = this.packageOptions.find(p => p.leaseId === this.bookingForm.value.venuePackageId)!;
  const selectedAtvt = this.activityOptions.find(a => a.activityId === this.bookingForm.value.venueActivityId)!;

  // Calculate total price
  const totalPrice = (selectedPkg.price || 0) * daysCount;

  // 4) Open the confirmation dialog with exactly the data shape we need:
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: {
      fullName:       this.bookingForm.value.fullName,
      phoneNumber:    this.bookingForm.value.phoneNumber,
      venue:          this.selectedVenueName,
      packageName:    selectedPkg.packageName,
      activityName:   selectedAtvt.activityName,
      price:          totalPrice,
      startDate:      startDate,
      endDate:        endDate,
      durationInDays: daysCount
    }
  });

  // 5) If the user confirmed, send the booking
  dialogRef.afterClosed().subscribe(confirmed => {
    if (!confirmed) return;

    // build the actual payload exactly as your backend expects:
  const payload = {
  venueId: this.bookingForm.value.venueId,
  venueActivityId: this.bookingForm.value.venueActivityId,
  venuePackageId: this.bookingForm.value.venuePackageId,
  startDate: startDate,
  startTime: selectedPkg.start || '06:00',
  // Get endDate directly from the form control, not from form.value object:
  endDate: this.bookingForm.get('endDate')!.value,
  endTime: selectedPkg.end || '00:00',
  fullName: this.bookingForm.value.fullName,
  phoneNumber: this.bookingForm.value.phoneNumber,
  email: this.bookingForm.value.email,
  address: this.bookingForm.value.address
};


    this.bookingService.createBooking(payload).subscribe({
      next: (res: any) => {
        this.snackBar.open('Booking created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/invoice', res.bookingId]);
      },
      error: () => {
        this.snackBar.open('Booking failed. Please try again.', 'Close', { duration: 3000 });
      }
    });
  });
}
}
