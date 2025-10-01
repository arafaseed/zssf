import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingService } from '../../Services/booking.service';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-booking',
  standalone:false,
  templateUrl: './confirm-booking.component.html',
  styleUrls: ['./confirm-booking.component.css']
})
export class ConfirmBookingComponent implements OnInit {
  accepted = false;
  submitting = false;
  errorMessage: string | null = null;

  activityPrice: number = 0;
  optionalPrice: number = 0;
  totalDays: number = 0;
  totalBookingPrice: number = 0;
  discountAmount: number = 0;
  netAmount: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ConfirmBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: BookingService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.computeValues();
  }

  private computeValues() {
    const booking = this.data?.booking;
    if (!booking) return;

    // ✅ Compute total days
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.floor((end.getTime() - start.getTime()) / msPerDay);
    this.totalDays = (isNaN(diff) ? 0 : diff) + 1;

    // ✅ Prices
    this.activityPrice = Number(booking.venueActivityPrice || 0);
    this.optionalPrice = Number(this.data?.selectedOptionalService?.price || 0);
    this.totalBookingPrice = (this.activityPrice + this.optionalPrice) * this.totalDays;

    // ✅ Employee-only discount
    if (booking.customer?.customerType === 'EMPLOYEE' || this.data.employeeVerified) {
      const discountRate = Number(booking.discountRate || 0);
      this.discountAmount = this.totalBookingPrice * discountRate;
      this.netAmount = this.totalBookingPrice - this.discountAmount;
    } else {
      this.discountAmount = 0;
      this.netAmount = 0;
    }
  }

  // Close dialog
  close(result: boolean) {
    this.dialogRef.close(result);
  }

  // Confirm and submit booking
  async confirmAndSubmit() {
    if (!this.accepted) return;
    this.errorMessage = null;

    const booking = this.data?.booking;
    if (!booking) {
      this.errorMessage = 'No booking data provided.';
      return;
    }

    const fd = new FormData();
    fd.append('booking', new Blob([JSON.stringify(booking)], { type: 'application/json' }));

    const attachedFile: File | null = this.data?.attachedFile ?? null;
    if (booking.customer?.customerType === 'ORGANIZATION' && !attachedFile) {
      this.errorMessage = 'Organization bookings require a PDF reference document.';
      return;
    }

    if (attachedFile) {
      fd.append('referenceDocument', attachedFile, attachedFile.name);
    }

    this.submitting = true;

    try {
      const resp: any = await firstValueFrom(this.api.placeReservation(fd));
      const bookingId = resp?.bookingId ?? resp?.id ?? null;

      if (bookingId) {
        this.dialogRef.close({ success: true, bookingId });
        this.snackBar.open('Booking created successfully.', 'OK', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        this.router.navigate(['/invoice', bookingId]);
        return;
      }

      const friendlyMessage = resp?.friendlyMessage ?? 'Booking created but we did not receive a reference.';
      this.snackBar.open(friendlyMessage, 'Close', { duration: 6000, horizontalPosition: 'right', verticalPosition: 'top' });
      this.errorMessage = friendlyMessage;
      this.submitting = false;
    } catch (err: any) {
      console.error('Booking submission error:', err);
      const friendlyError = err?.friendlyMessage ?? 'We could not complete your booking. Please try again later.';
      this.snackBar.open(friendlyError, 'Close', { duration: 6000, horizontalPosition: 'right', verticalPosition: 'top' });
      this.errorMessage = friendlyError;
      this.submitting = false;
    }
  }
}
