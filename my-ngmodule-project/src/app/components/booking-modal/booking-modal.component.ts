import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BookingService } from '../../Services/booking.service';
import { EmployeeVerifyComponent } from '../employee-verify/employee-verify.component';
import { ConfirmBookingComponent } from '../confirm-booking/confirm-booking.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-booking-modal',
  standalone: false,
  templateUrl: './booking-modal.component.html',
  styleUrls: ['./booking-modal.component.css']
})
export class BookingModalComponent implements OnInit {
  detailsForm!: FormGroup;
  attachedFile: File | null = null;
  fileError: string | null = null;
  isSubmitting = false;
  optionalServices: any[] = [];
  discountRate = 0;
  employeeVerified = false;
  verifying = false;

  constructor(
    public ref: MatDialogRef<BookingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private api: BookingService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    const phonePattern = /^(0)\d{9}$/;

    this.detailsForm = this.fb.group({
      optionalServiceId: [null],
      customerName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(phonePattern)]],
      email: ['', [Validators.email]],
      address: ['', Validators.required],
      customerType: ['', Validators.required],
    });

    // Load optional services
    if (this.data?.venueId) {
      this.api.getOptionalServicesForVenue(this.data.venueId).subscribe({
        next: (arr) => {
          this.optionalServices = Array.isArray(arr) ? arr : [];
        },
        error: (err) => {
          console.warn('Failed loading optional services for venue', err);
          this.optionalServices = [];
        }
      });
    }

    // Watch for customer type changes (auto discount for government institution)
    this.detailsForm.get('customerType')?.valueChanges.subscribe((type) => {
      if (type === 'ORGANIZATION') {
        this.discountRate = 0.25;
        this.employeeVerified = true;
      } else {
        this.discountRate = 0;
         this.employeeVerified = false;
      }
    });
  }

  onPhoneInput(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input) return;
    let v = input.value || '';
    v = v.replace(/\D/g, '');
    if (v.length > 10) v = v.slice(0, 10);
    input.value = v;
    this.detailsForm.patchValue({ phoneNumber: v });
  }

  onFileSelected(e: Event) {
    this.fileError = null;
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.attachedFile = null;
      return;
    }
    const f = input.files[0];
    if (f.type !== 'application/pdf') {
      this.fileError = 'Only PDF allowed';
      this.attachedFile = null;
      return;
    }
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      this.fileError = 'File must be .pdf';
      this.attachedFile = null;
      return;
    }
    this.attachedFile = f;
  }

  openEmployeeVerify(event: MatCheckboxChange): void {
    if (event.checked) {
      try {
        event.source.checked = false;
      } catch {}
      this.verifying = true;

      const dlg = this.dialog.open(EmployeeVerifyComponent, { width: '420px' });
      dlg.afterClosed().subscribe(
        (result: any) => {
          this.verifying = false;
          if (result && result.verified) {
            this.employeeVerified = true;
            this.discountRate = result.discountRate ?? 0;
          } else {
            this.employeeVerified = false;
            this.discountRate = 0;
          }
        },
        () => {
          this.verifying = false;
          this.employeeVerified = false;
          this.discountRate = 0;
        }
      );
    } else {
      this.employeeVerified = false;
      this.discountRate = 0;
    }
  }

  buildBookingObject() {
    let startDateStr: string, endDateStr: string, startTimeStr: string, endTimeStr: string;
    if (this.data.mode === 'single' && this.data.item) {
      startDateStr = this.data.item.date;
      endDateStr = this.data.item.date;
      startTimeStr = this.data.item.bookedStart ?? (this.data.startTime ?? '09:00');
      endTimeStr = this.data.item.bookedEnd ?? (this.data.endTime ?? '17:00');
    } else {
      const s = new Date(this.data.start);
      const e = new Date(this.data.end);
      const pad = (n: number) => String(n).padStart(2, '0');
      const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      startDateStr = toYMD(s);
      endDateStr = toYMD(e);
      startTimeStr = this.data.startTime ?? '09:00';
      endTimeStr = this.data.endTime ?? '17:00';
    }

    return {
      startDate: startDateStr,
      startTime: `${startTimeStr}:00`,
      endDate: endDateStr,
      endTime: `${endTimeStr}:00`,
      venueId: this.data.venueId,
      venueActivityId: this.data.activityId,
      venueActivityName: this.data.activityName,
      venueActivityPrice: this.data.activityPrice,
      venueOptionalServiceId: this.detailsForm.value.optionalServiceId ?? null,
      customer: {
        customerName: this.detailsForm.value.customerName,
        phoneNumber: this.detailsForm.value.phoneNumber,
        email: this.detailsForm.value.email,
        address: this.detailsForm.value.address,
        customerType: this.detailsForm.value.customerType
      },
      discountRate: this.discountRate || 0
    };
  }

  submitBooking() {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }

    if (this.detailsForm.value.customerType === 'ORGANIZATION' && !this.attachedFile) {
      this.fileError = this.translate.instant('booking.uploadRequired');
      return;
    }

    const booking = this.buildBookingObject();
    const selectedOptionalService =
      this.optionalServices.find((s) => s.serviceId === booking.venueOptionalServiceId) ?? null;

    this.isSubmitting = true;

    const dlgRef = this.dialog.open(ConfirmBookingComponent, {
      width: '680px',
      data: {
        booking,
        attachedFile: this.attachedFile ?? null,
        venueName: this.data.venueName,
        employeeVerified: this.employeeVerified,
        selectedOptionalService
      },
      maxHeight: '85vh'
    });

    dlgRef.afterClosed().subscribe((result: any) => {
      this.isSubmitting = false;
      const userFriendlyDefault =
        'We could not complete the submission right now. Please try again later or contact support.';

      if (result && result.success && result.bookingId) {
        this.ref.close({ success: true, bookingId: result.bookingId });
        this.snackBar.open('Booking created successfully.', 'OK', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        return;
      }

      const friendlyFromBackend = result?.friendlyMessage;
      const messageToShow =
        friendlyFromBackend && typeof friendlyFromBackend === 'string'
          ? friendlyFromBackend
          : userFriendlyDefault;

      this.snackBar.open(messageToShow, 'Close', {
        duration: 6000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });

      if (result?.error) {
        console.error('Submission failed (backend details):', result.error);
      } else {
        console.warn('Submission did not succeed; no backend error provided.', result);
      }
    });
  }

  cancel() {
    this.ref.close(null);
  }
}
