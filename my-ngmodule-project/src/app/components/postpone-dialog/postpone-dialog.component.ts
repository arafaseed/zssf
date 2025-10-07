import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-postpone-dialog',
  standalone: false,
  templateUrl: './postpone-dialog.component.html',
  styleUrl: './postpone-dialog.component.css'
})
export class PostponeDialogComponent {
   newStartDate: Date | null = null;
  newEndDate: Date | null = null;
  newStartTime: string = '';
  newEndTime: string = '';

  constructor(
    public dialogRef: MatDialogRef<PostponeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirmPostpone(): void {
    this.dialogRef.close({
      bookingId: this.data.booking.bookingId,
      newStartDate: this.newStartDate,
      newStartTime: this.newStartTime,
      newEndDate: this.newEndDate,
      newEndTime: this.newEndTime
    });
  }
}
