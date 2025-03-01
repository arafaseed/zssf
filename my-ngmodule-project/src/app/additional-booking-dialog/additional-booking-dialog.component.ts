import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-additional-booking-dialog',
  templateUrl: './additional-booking-dialog.component.html',
  standalone :false,
  styleUrls: ['./additional-booking-dialog.component.css']
})
export class AdditionalBookingDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AdditionalBookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}