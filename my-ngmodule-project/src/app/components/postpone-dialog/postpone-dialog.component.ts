import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-postpone-dialog',
  standalone: false,
  templateUrl: './postpone-dialog.component.html',
  styleUrl: './postpone-dialog.component.css'
})
export class PostponeDialogComponent {
   newStartDate!: Date;
  newEndDate!: Date;
  newStartTime!: string;
  newEndTime!: string;

  constructor(
    public dialogRef: MatDialogRef<PostponeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Initialize with data from availability check
    this.newStartDate = new Date(data.startDate);
    this.newEndDate = new Date(data.endDate);
    this.newStartTime = data.startTime;
    this.newEndTime = data.endTime;
  }

  confirmPostpone() {
    // Return the updated data to parent component
    this.dialogRef.close({
      newStartDate: this.newStartDate,
      newEndDate: this.newEndDate,
      newStartTime: this.newStartTime,
      newEndTime: this.newEndTime
    });
  }
}
