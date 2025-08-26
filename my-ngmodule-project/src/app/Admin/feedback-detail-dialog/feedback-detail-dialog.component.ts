import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FeedbackDto } from '../../models/models'; // adjust path

@Component({
  selector: 'app-feedback-detail-dialog',
  standalone: false,
  templateUrl: './feedback-detail-dialog.component.html',
  styleUrls: ['./feedback-detail-dialog.component.css']
})
export class FeedbackDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<FeedbackDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FeedbackDto
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
