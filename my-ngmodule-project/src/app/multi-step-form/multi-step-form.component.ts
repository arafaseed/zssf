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
import { ChangeDetectorRef } from '@angular/core';

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
  bookedDatesSet = new Set<string>();
  dateError: string | null = null;

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
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
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
      phoneNumber: [
    '',[
      Validators.required,
      Validators.pattern('^(06|07|08)\\d{8}$'),
      Validators.minLength(10),
      Validators.maxLength(10)
      ]],
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

    // const venueId = /* get your venueId from route or session */;
    this.bookingService.getBookedSlots(this.venueId).subscribe(slots => {
      for (const s of slots) {
        // const dateOnly = new Date(s.date).toISOString().split('T')[0];
        // this.bookedDatesSet.add(dateOnly);
        this.bookedDatesSet.add(s.date);
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.pollId);
  }

  /** Called whenever the user picks (or types) a date */
  onStartDateChange(event: MatDatepickerInputEvent<Date>) {
    const d = event.value;
    if (!d) {
      this.dateError = null;
      return;
    }
    const cell = new Date(d);
    const today = new Date();
    const iso = d.toISOString().split('T')[0];

    if (this.bookedDatesSet.has(iso)) {
      // booked → show error and clear field
      this.dateError = 'That date is already booked';
      this.bookingForm.get('startDate')!.reset();
    } else if(cell <= today) {
      this.dateError = 'Cannot book for today or on past dates';
      this.bookingForm.get('startDate')!.reset();
    } else {
      this.dateError = null;
      this.calculateEndDate();
    }
    
    
  }

  /** Tint booked dates red, past dates gray */
  dateClass = (d: Date, view: string): string => {
  if (view !== 'month') return '';

  const cell = new Date(d);
  cell.setHours(0,0,0,0);
  const today = new Date();
  today.setHours(0,0,0,0);
  // const iso = cell.toISOString().split('T')[0];
  const iso = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;


  if (cell <= today) {
    return 'past-date';
  }
  if (this.bookedDatesSet.has(iso)) {
    return 'booked-date';
  }
  return 'available-date';
};

  private formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
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

  back() {
    this.router.navigate(['/venue']);
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

  assurance(){
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
  }

  onSubmit() {
  // mark *all* fields touched so errors show up
  Object.values(this.bookingForm.controls).forEach(ctrl => ctrl.markAsTouched());

  if (this.bookingForm.invalid) {
    this.snackBar.open('Please complete all fields.', 'Close', { duration: 3000 });
    return;
  }

  // 3) Gather the values we need for the confirmation dialog:
  const daysCount = this.bookingForm.value.daysCount;
  const rawStartDate: Date = this.bookingForm.value.startDate;
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
      startDate:      rawStartDate,
      endDate:        endDate,
      durationInDays: daysCount
    }
  });

  // 5) If the user confirmed, send the booking
  dialogRef.afterClosed().subscribe(confirmed => {
    if (!confirmed) return;

    const payload = {
      venueId:           this.bookingForm.value.venueId,
      venueActivityId:   this.bookingForm.value.venueActivityId,
      venuePackageId:    this.bookingForm.value.venuePackageId,
      startDate:         this.formatDate(this.bookingForm.get('startDate')!.value),
      endDate:           this.formatDate(this.bookingForm.get('endDate')!.value),
      startTime:         selectedPkg.start || '06:00',
      endTime:           selectedPkg.end   || '00:00',
      fullName:          this.bookingForm.value.fullName,
      phoneNumber:       this.bookingForm.value.phoneNumber,
      email:             this.bookingForm.value.email,
      address:           this.bookingForm.value.address
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
