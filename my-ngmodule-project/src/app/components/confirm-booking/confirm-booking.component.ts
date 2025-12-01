import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BookingService } from '../../Services/booking.service';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

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

  activityPrice: number = 0;
  optionalPrice: number = 0;
  totalDays: number = 0;
  totalBookingPrice: number = 0;
  discountAmount: number = 0;
  netAmount: number = 0;
  halfPayment: number = 0; // 🟢 50% upfront payment

  constructor(
    public dialogRef: MatDialogRef<ConfirmBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: BookingService,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private matDialog: MatDialog
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
      this.netAmount = this.totalBookingPrice;
    }

    // ✅ Calculate 50% upfront payment
    this.halfPayment = this.netAmount * 0.5;
  }

  close(result: boolean) {
    this.dialogRef.close(result);
  }async confirmAndSubmit() {
  if (!this.accepted) return;
  this.errorMessage = null;

  const booking = this.data?.booking;
  if (!booking) {
    this.errorMessage = 'No booking data provided.';
    return;
  }

  const customerType = booking.customer?.customerType;
   const pendingMinutes = booking.pendingExpiresInMinutes ?? 24 * 60; // fallback to 24 hours if not provided
  const hours = Math.floor(pendingMinutes / 60);
  const minutes = pendingMinutes % 60;
  const attachedFile: File | null = this.data?.attachedFile ?? null;

  if (customerType === 'ORGANIZATION' && !attachedFile) {
    this.errorMessage = 'Organization bookings require a PDF reference document.';
    return;
  }

  // 🟢 Choose translation keys based on customer type
  let titleKey = '';
  let messageKey = '';

  if (customerType === 'INDIVIDUAL') {
    titleKey = 'Payment.titleIndividual';
    messageKey = 'Payment.msgIndividual';
  } else if (customerType === 'ORGANIZATION') {
    titleKey = 'Payment.titleGovernment';
    messageKey = 'Payment.msgGovernment';
  }

  // 🟢 Final formatted message with spacing + continue question
  const messageHtml =
    `${this.translate.instant(messageKey)}` +
    `${this.translate.instant('Payment.continue')}`;

  const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
    width: '420px',
    data: {
      title: this.translate.instant(titleKey),
      message: this.translate.instant(messageKey, { hours })
    }
  });

  const proceed = await dialogRef.afterClosed().toPromise();
  if (!proceed) {
    this.dialogRef.close(false);
    return;
  }

  // 🟢 Submit booking
  const fd = new FormData();
  fd.append('booking', new Blob([JSON.stringify(booking)], { type: 'application/json' }));
  if (attachedFile) {
    fd.append('referenceDocument', attachedFile, attachedFile.name);
  }

  this.submitting = true;

  try {
    const resp: any = await firstValueFrom(this.api.placeReservation(fd));
    const bookingId = resp?.bookingId ?? resp?.id ?? null;

    if (bookingId) {
      this.dialogRef.close({ success: true, bookingId });
      this.snackBar.open(this.translate.instant('Message.success'), 'OK', {
        duration: 4000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });

      setTimeout(() => {
        this.router.navigate(['/invoice', bookingId]);
      }, 1000);

      return;
    }

    const friendlyMessage = resp?.friendlyMessage ?? 'Booking created but no reference received.';
    this.snackBar.open(friendlyMessage, 'Close', {
      duration: 6000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
    this.errorMessage = friendlyMessage;
    this.submitting = false;

  } catch (err: any) {
    console.error('Booking submission error:', err);
    const friendlyError = err?.friendlyMessage ?? 'We could not complete your booking. Please try again later.';
    this.snackBar.open(friendlyError, 'Close', {
      duration: 6000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
    this.errorMessage = friendlyError;
    this.submitting = false;
  }
}

}
