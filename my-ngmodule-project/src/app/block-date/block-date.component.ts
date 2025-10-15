import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-block-date',
  standalone: false,
  templateUrl: './block-date.component.html',
  styleUrl: './block-date.component.css'
})

export class BlockDateComponent {
  blockDateForm: FormGroup;
  blockedDates: string[] = []; // This can come from backend

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.blockDateForm = this.fb.group({
      date: ['', Validators.required]
    });
  }

  blockDate() {
    if (this.blockDateForm.invalid) return;

    const date = this.blockDateForm.value.date;
    if (this.blockedDates.includes(date)) {
      this.snackBar.open('Date is already blocked!', 'Close', { duration: 3000 });
      return;
    }

    // Ideally call backend API to save blocked date
    this.blockedDates.push(date);
    this.snackBar.open(`Date ${date} blocked successfully!`, 'Close', { duration: 3000 });

    this.blockDateForm.reset();
  }

  unblockDate(date: string) {
    this.blockedDates = this.blockedDates.filter(d => d !== date);
    this.snackBar.open(`Date ${date} is now unblocked!`, 'Close', { duration: 3000 });
  }
}