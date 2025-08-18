import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingService } from '../../Services/booking.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-booking',
  standalone: false,
  templateUrl: './confirm-booking.component.html',
  styleUrls: ['./confirm-booking.component.css']
})
export class ConfirmBookingComponent {
  accepted = false;
  submitting = false;
  errorMessage: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<ConfirmBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: BookingService,
    private router: Router
  ) {}

  close(ok: boolean) {
    this.dialogRef.close(ok);
  }

  async confirmAndSubmit() {
    if (!this.accepted) return;
    this.errorMessage = null;

    const booking = this.data?.booking;
    if (!booking) {
      this.errorMessage = 'No booking data provided.';
      return;
    }

    // If employeeVerified flag exists, apply discount here (confirm is authoritative)
    if (this.data.employeeVerified) {
      booking.discountRate = 0.25;
    } else {
      booking.discountRate = booking.discountRate ?? 0;
    }

    // Build FormData
    const fd = new FormData();
    fd.append('booking', new Blob([JSON.stringify(booking)], { type: 'application/json' }));

    const attachedFile: File | null = this.data?.attachedFile ?? null;
    if (booking.customer?.customerType === 'ORGANIZATION') {
      if (!attachedFile) {
        this.errorMessage = 'Organization bookings require a PDF reference document.';
        return;
      }
      fd.append('referenceDocument', attachedFile, attachedFile.name);
    } else {
      if (attachedFile) {
        fd.append('referenceDocument', attachedFile, attachedFile.name);
      }
    }

    this.submitting = true;

    try {
      const resp: any = await firstValueFrom(this.api.placeReservation(fd));
      const bookingId = resp?.bookingId ?? resp?.id ?? null;
      if (bookingId) {
        this.dialogRef.close({ success: true, bookingId });
        this.router.navigate(['/invoice', bookingId]);
      } else {
        this.errorMessage = 'Booking created but server returned no bookingId.';
        this.submitting = false;
      }
    } catch (err: any) {
      console.error('Place reservation failed', err);
      this.errorMessage = err?.message ?? 'Booking failed';
      this.submitting = false;
    }
  }
}
