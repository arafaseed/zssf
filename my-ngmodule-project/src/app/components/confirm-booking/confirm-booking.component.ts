import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-booking',
  standalone: false,
  templateUrl: './confirm-booking.component.html',
  styleUrls: ['./confirm-booking.component.css']
})
export class ConfirmBookingComponent {
  accepted = false;
  constructor(public dialogRef: MatDialogRef<ConfirmBookingComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}
  close(ok: boolean) { this.dialogRef.close(ok); }
}
