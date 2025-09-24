import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingService } from '../../Services/booking.service';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-booking',
  standalone: false,
  templateUrl: './confirm-booking.component.html',
  styleUrls: ['./confirm-booking.component.css']
})
export class ConfirmBookingComponent implements OnInit {
  accepted = false;
  submitting = false;
  errorMessage: string | null = null;

  // computed fields
  totalDays: number = 1;
  optionalPrice: number = 0;
  activityPrice: number = 0;
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
    // compute derived values right away — non-destructive
    this.computeDerivedValues();
  }

  close(ok: boolean) {
    this.dialogRef.close(ok);
  }

  private computeDerivedValues() {
    const booking = this.data?.booking ?? null;
    if (!booking) {
      // nothing to compute
      this.totalDays = 1;
      this.optionalPrice = 0;
      this.activityPrice = 0;
      this.totalBookingPrice = 0;
      this.discountAmount = 0;
      this.netAmount = 0;
      return;
    }

    // parse dates. buildBookingObject emits yyyy-mm-dd strings.
    const safeParseYMD = (s: string | undefined | null): Date | null => {
      if (!s) return null;
      // expected format: YYYY-MM-DD
      const parts = String(s).split('-').map(p => p.trim());
      if (parts.length !== 3) {
        // fallback to Date.parse
        const ts = Date.parse(String(s));
        return isNaN(ts) ? null : new Date(ts);
      }
      const y = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      const d = Number(parts[2]);
      if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
      return new Date(y, m, d);
    };

    const start = safeParseYMD(booking.startDate);
    const end = safeParseYMD(booking.endDate);

    if (start && end) {
      const msPerDay = 1000 * 60 * 60 * 24;
      // compute inclusive days: difference in UTC days + 1
      const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
      const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
      const diff = Math.floor((utcEnd - utcStart) / msPerDay);
      this.totalDays = (isNaN(diff) ? 0 : diff) + 1;
      if (this.totalDays < 1) this.totalDays = 1;
    } else {
      // fallback: assume 1 day
      this.totalDays = 1;
    }

    // prices
    this.activityPrice = Number(booking.venueActivityPrice ?? 0) || 0;
    // optional service price: prefer selectedOptionalService passed in data; fallback to 0
    this.optionalPrice = Number(this.data?.selectedOptionalService?.price ?? 0) || 0;

    // total booking price (activity price + optional) * days
    this.totalBookingPrice = (this.activityPrice + this.optionalPrice) * this.totalDays;

    const discountRate = Number(booking.discountRate ?? 0) || 0;
    const safeRate = Number(booking.discountRate);
    this.discountAmount = this.totalBookingPrice * safeRate;
    this.netAmount = this.totalBookingPrice - this.discountAmount;

    // make sure numeric fields are non-negative
    if (this.totalBookingPrice < 0) this.totalBookingPrice = 0;
    // if (this.discountAmount < 0) this.discountAmount = 0;
    if (this.netAmount < 0) this.netAmount = 0;
  }

  async confirmAndSubmit() {
    if (!this.accepted) return;
    this.errorMessage = null;

    const booking = this.data?.booking;
    if (!booking) {
      this.errorMessage = 'No booking data provided.';
      return;
    }

    // Apply employee discount here (confirm step has the authority)
    if (this.data.employeeVerified) {
      booking.discountRate = booking.discountRate ?? 0;
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
    // Success: close dialog, notify user (friendly), then navigate
    this.dialogRef.close({ success: true, bookingId });
    this.snackBar.open('Booking created successfully.', 'OK', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
    this.router.navigate(['/invoice', bookingId]);
    return;
  }

  // No bookingId returned — show friendly message (prefer backend friendlyMessage if provided)
  const friendlyWhenMissingId = resp?.friendlyMessage
    ?? 'Booking created but we did not receive a booking reference. Please check your bookings or contact support.';
  this.snackBar.open(friendlyWhenMissingId, 'Close', {
    duration: 6000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  });
  this.errorMessage = friendlyWhenMissingId;
  this.submitting = false;

} catch (err: any) {
  // Developer-only details
  console.error('Place reservation failed (details):', err);

  // Friendly message for the user — prefer backend `friendlyMessage` but NEVER display raw error
  const friendlyOnError = err?.friendlyMessage
    ?? 'We could not complete your booking right now. Please try again later or contact support.';

  this.snackBar.open(friendlyOnError, 'Close', {
    duration: 6000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  });

  this.errorMessage = friendlyOnError;
  this.submitting = false;
}

  }
}
