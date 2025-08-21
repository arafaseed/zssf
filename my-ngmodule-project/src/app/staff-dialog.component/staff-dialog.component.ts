import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-staff-dialog',
  templateUrl: './staff-dialog.component.html',
  standalone:false,
  styleUrls: ['./staff-dialog.component.css']
})
export class StaffDialogComponent {
  staffForm: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StaffDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data; // true if editing, false if adding

    this.staffForm = this.fb.group({
      staffIdentification: [data?.staffIdentification || '', Validators.required],
      fullName: [data?.fullName || '', Validators.required],
      phoneNumber: [data?.phoneNumber || '', Validators.required],
      password: [
        '', 
        this.isEditMode ? null : Validators.required // required only in add mode
      ],
      role: [data?.role || '', Validators.required]
    });
  }

  onSave() {
    if (this.staffForm.valid) {
      this.dialogRef.close(this.staffForm.value);
    } else {
      this.staffForm.markAllAsTouched(); // show validation errors
    }
  }
}
