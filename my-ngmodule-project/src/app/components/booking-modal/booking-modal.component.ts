import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../Services/booking.service';
import { ConfirmBookingComponent } from '../confirm-booking/confirm-booking.component';

@Component({
  selector: 'app-booking-modal',
  standalone: false,
  templateUrl: './booking-modal.component.html',
  styleUrls: ['./booking-modal.component.css']
})
export class BookingModalComponent implements OnInit {
  detailsForm!: FormGroup;
  attachedFile?: File | null = null;
  fileError?: string | null = null;
  isSubmitting = false; // used to disable submit while confirm opens
  optionalServices: any[] = [];
  discountRate = 0; // UI-only; Confirm will actually apply discount if verified
  employeeVerified = false;

  constructor(
    public ref: MatDialogRef<BookingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private api: BookingService
  ) {}

  ngOnInit() {
    // Phone rules: must start with 06/07/08 and be 10 digits total
    const phonePattern = /^(06|07|08)\d{8}$/;

    this.detailsForm = this.fb.group({
      optionalServiceId: [null],
      customerName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(phonePattern)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      customerType: ['INDIVIDUAL', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });

    // Load optional services for this venue using service
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
  }

  // enforce digits-only and max length 10 client-side while user types
  onPhoneInput(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input) return;
    let v = input.value || '';
    // keep digits only
    v = v.replace(/\D/g, '');
    if (v.length > 10) v = v.slice(0, 10);
    // write back cleaned value
    input.value = v;
    // update form control value so validators run
    this.detailsForm.patchValue({ phoneNumber: v });
  }

  onFileSelected(e: Event) {
    this.fileError = null;
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) { this.attachedFile = null; return; }
    const f = input.files[0];
    if (f.type !== 'application/pdf') { this.fileError = 'Only PDF allowed'; this.attachedFile = null; return; }
    if (!f.name.toLowerCase().endsWith('.pdf')) { this.fileError = 'File must be .pdf'; this.attachedFile = null; return; }
    this.attachedFile = f;
  }

  openEmployeeVerify() {
    // Open verify dialog (your existing EmployeeVerifyComponent)
    const dlg = this.dialog.open('EmployeeVerifyComponent' as any, { width: '420px' });
    dlg.afterClosed().subscribe((ok: any) => {
      if (ok && ok.verified) {
        this.employeeVerified = true;
        this.discountRate = 0.25;
      } else {
        this.employeeVerified = false;
        this.discountRate = 0;
      }
    });
  }

  buildBookingObject() {
    // determine date/time (selectedItem override from data.mode)
    let startDateStr: string, endDateStr: string, startTimeStr: string, endTimeStr: string;
    if (this.data.mode === 'single' && this.data.item) {
      startDateStr = this.data.item.date;
      endDateStr = this.data.item.date;
      startTimeStr = this.data.item.bookedStart ?? (this.data.startTime ?? '09:00');
      endTimeStr = this.data.item.bookedEnd ?? (this.data.endTime ?? '17:00');
    } else {
      const s = new Date(this.data.start);
      const e = new Date(this.data.end);
      const pad = (n:number)=>String(n).padStart(2,'0');
      const toYMD = (d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
      startDateStr = toYMD(s);
      endDateStr = toYMD(e);
      startTimeStr = (this.data.startTime ?? '09:00');
      endTimeStr = (this.data.endTime ?? '17:00');
    }

    const booking = {
      startDate: startDateStr,
      startTime: `${startTimeStr}:00`,
      endDate: endDateStr,
      endTime: `${endTimeStr}:00`,
      venueId: this.data.venueId,
      venueActivityId: this.data.activityId,
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
    return booking;
  }

  submitBooking() {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }

    const booking = this.buildBookingObject();

    // find selected optional service object to display in confirm dialog (name + price)
    const selectedOptionalService = this.optionalServices.find(s => s.serviceId === booking.venueOptionalServiceId) ?? null;

    // Open Confirm dialog and pass booking + attached file + venueName + employeeVerified flag + selected optional service
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
      if (result && result.success && result.bookingId) {
        // booking created - close this modal; Confirm already navigated to invoice
        this.ref.close({ success: true, bookingId: result.bookingId });
      } else {
        // not confirmed or failed — stay open
      }
    });
  }

  cancel() { this.ref.close(null); }
}
