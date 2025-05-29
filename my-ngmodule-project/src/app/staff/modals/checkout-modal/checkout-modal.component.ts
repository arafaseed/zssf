import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffBookingService } from '../../staff-booking.service';

@Component({
  selector: 'app-checkout-modal',
  standalone: false,
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.css']
})
export class CheckoutModalComponent {
  @Input() booking!: any;
  @Input() staffIDN!: string;
  @Output() close = new EventEmitter<void>();
  @Output() checkedOut = new EventEmitter<void>();

  form: FormGroup;
  conditionStatuses = ['GOOD', 'FAIR', 'BAD', 'CRITICAL'];
  submitting = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private bookingService: StaffBookingService
  ) {
    this.form = this.fb.group({
      conditionStatus: ['', Validators.required],
      conditionDescription: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    this.errorMessage = null;

    const payload = {
      bookingCode: this.booking.bookingCode,
      staffIDN: this.staffIDN,
      conditionStatus: this.form.value.conditionStatus,
      conditionDescription: this.form.value.conditionDescription
    };

    this.bookingService.checkOut(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.checkedOut.emit();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Check-out failed.';
        console.error('Check-out failed', err);
        this.submitting = false;
      }
    });
  }

  onCancel(): void {
    this.close.emit();
  }
}
