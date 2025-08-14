import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeVerifyComponent } from '../employee-verify/employee-verify.component';
import { ConfirmBookingComponent } from '../confirm-booking/confirm-booking.component';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-booking-modal',
  standalone: false,
  templateUrl: './booking-modal.component.html',
  styleUrls: ['./booking-modal.component.css']
})
export class BookingModalComponent implements OnInit {
  // incoming data: { venueId, venueName, start, end, startTime, endTime, activityId, activityName }
  step: 'checking' | 'chooseFromResponse' | 'details' | 'summary' | 'submitting' = 'checking';

  availabilityResponse: any[] = [];
  selectedItem: any | null = null; // user selected single day from response
  detailsForm!: FormGroup;
  optionalServices: any[] = []; // you can populate this from server if needed
  attachedFile?: File | null = null;
  fileError?: string | null = null;

  discountRate = 0; // applied only when employee verification succeeded
  employeeChecked = false;       // UI checkbox state
  isEmployeeVerified = false;    // true only if verified

  constructor(
    public ref: MatDialogRef<BookingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    // Form initialization (unchanged logic)
    this.detailsForm = this.fb.group({
      optionalServiceId: [null],
      customerName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      email: ['', [ Validators.email]],
      address: ['',[Validators.required]],
      customerType: ['INDIVIDUAL', Validators.required],
      acceptTerms: [false, Validators.requiredTrue] // used in confirm step
    });

    // start availability check as before
    this.checkAvailability();
  }

  private formatDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private formatTime(t: string): string {
    // expected HH:mm
    return t;
  }

  checkAvailability() {
    if (!this.data || !this.data.venueId) return;

    const payload = {
      startDate: this.formatDate(new Date(this.data.start)),
      endDate: this.formatDate(new Date(this.data.end)),
      startTime: this.formatTime(this.data.startTime ?? (this.data.start?.toTimeString ? this.data.start.toTimeString().slice(0,5) : '09:00')),
      endTime: this.formatTime(this.data.endTime ?? (this.data.end?.toTimeString ? this.data.end.toTimeString().slice(0,5) : '17:00'))
    };

    this.step = 'checking';
    this.http.post<any[]>(`http://localhost:8080/api/bookings/venue/${this.data.venueId}/availability`, payload).subscribe({
      next: (res) => {
        this.availabilityResponse = res || [];

        // If every day in the returned array is available -> user can continue with full range
        const allAvailable = this.availabilityResponse.length > 0 &&
          this.availabilityResponse.every(it => it.flag === 'AVAILABLE_FOR_BOOKING');

        if (allAvailable) {
          this.selectedItem = null; // keep original range
          this.step = 'chooseFromResponse';
        } else {
          // There are some ALREADY_BOOKED days: show list and force user selection or cancel
          this.step = 'chooseFromResponse';
        }
      },
      error: (err) => {
        console.error('Availability check failed', err);
        // allow user to continue but show details step and a banner warning
        this.step = 'details';
      }
    });
  }

  // Called when user selects a single item from availabilityResponse
  onSelectList(event: any) {
    // mat-selection-list gives selected options via event.options
    const selected = event.options?.[0]?.value ?? null;
    this.selectedItem = selected;
  }



  // When user clicks "Choose" on a specific list item
  chooseResponseItemDirect(item: any) {
    this.selectedItem = item;
    this.step = 'details';
  }

  onFileSelected(event: Event) {
    this.fileError = null;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.attachedFile = null;
      return;
    }
    const f = input.files[0];
    if (f.type !== 'application/pdf') {
      this.fileError = 'Only PDF files are allowed';
      this.attachedFile = null;
      return;
    }
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      this.fileError = 'File must have .pdf extension';
      this.attachedFile = null;
      return;
    }
    this.attachedFile = f;
  }

  // Checkbox changed -> if checked, open verification. If unchecked, remove discount.
  onEmployeeCheckboxChange(ev: any) {
    const checked = ev.checked ?? ev.target?.checked ?? false;
    // set UI state first
    this.employeeChecked = checked;
    if (checked) {
      this.openEmployeeVerify();
    } else {
      // user un-checked, revoke verification & discount
      this.isEmployeeVerified = false;
      this.discountRate = 0;
    }
  }

  openEmployeeVerify() {
    const dlg = this.dialog.open(EmployeeVerifyComponent, { width: '420px' });
    dlg.afterClosed().subscribe((ok: any) => {
      if (ok && ok.verified) {
        this.isEmployeeVerified = true;
        this.discountRate = 0.25;
        this.employeeChecked = true;
      } else {
        // not verified -> revert checkbox and keep discount 0
        this.isEmployeeVerified = false;
        this.discountRate = 0;
        this.employeeChecked = false;
      }
    });
  }

  async proceedToConfirm() {
    console.log('proceedToConfirm called');
  if (!this.detailsForm) { console.warn('detailsForm missing'); return; }
  if (this.detailsForm.invalid) {
    console.log('form invalid'); this.detailsForm.markAllAsTouched(); return;
  }
  console.log('form valid — opening dialog');

    // determine dates/times to use (selectedItem overrides range)
    let startDateStr: string, endDateStr: string, startTimeStr: string, endTimeStr: string;
    if (this.selectedItem) {
      startDateStr = this.selectedItem.date;
      endDateStr = this.selectedItem.date;
      startTimeStr = this.selectedItem.bookedStart ?? (this.data.startTime ?? '09:00');
      endTimeStr = this.selectedItem.bookedEnd ?? (this.data.endTime ?? '17:00');
    } else {
      const s = new Date(this.data.start);
      const e = new Date(this.data.end);
      startDateStr = this.formatDate(s);
      endDateStr = this.formatDate(e);
      startTimeStr = (this.data.startTime ?? (this.data.start?.slice ? this.data.start.slice(11,16) : '09:00')) ?? '09:00';
      endTimeStr = (this.data.endTime ?? (this.data.end?.slice ? this.data.end.slice(11,16) : '17:00')) ?? '17:00';
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
      discountRate: this.discountRate
    };

    // open confirm dialog (user must accept T&C inside)
    const dlgRef = this.dialog.open(ConfirmBookingComponent, {
      width: '760px',
      data: { booking, attachedFileName: this.attachedFile?.name ?? null, venueName: this.data.venueName }
    });

    dlgRef.afterClosed().subscribe(async (confirmed: any) => {
      if (!confirmed) return;
      this.step = 'submitting';

      try {
        const formData = new FormData();
        formData.append('booking', new Blob([JSON.stringify(booking)], { type: 'application/json' }));
        if (booking.customer.customerType === 'ORGANIZATION') {
          if (!this.attachedFile) {
            alert('Organization bookings require a PDF reference document.');
            this.step = 'details';
            return;
          }
          formData.append('referenceDocument', this.attachedFile, this.attachedFile.name);
        }

        // POST to create booking (unchanged)
        // const resp: any = await this.http.post('http://localhost:8080/api/bookings/create', formData).toPromise();
        const resp: any = await firstValueFrom(this.http.post('http://localhost:8080/api/bookings/create', formData));
        const bookingId = resp?.bookingId ?? resp?.id ?? null;
        if (bookingId) {
          this.ref.close({ success: true, bookingId });
          this.router.navigate(['/invoice', bookingId]);
        } else {
          alert('Booking created but server returned no bookingId. Check server response.');
          this.step = 'details';
        }
      } catch (err: any) {
        console.error(err);
        alert('Booking failed: ' + (err?.message ?? 'unknown error'));
        this.step = 'details';
      }
    });
  }

  cancel() {
    this.ref.close(null);
  }
}
