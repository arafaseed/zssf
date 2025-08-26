import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-staff-dialog',
  templateUrl: './staff-dialog.component.html',
  standalone: false,
  styleUrls: ['./staff-dialog.component.css']
})
export class StaffDialogComponent {
  staffForm: FormGroup;
  isEditMode: boolean;
  roles: string[] = ['ADMIN', 'STAFF']; // 👈 added roles

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StaffDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data; // true if editing, false if adding

    this.staffForm = this.fb.group({
      staffIdentification: [
        data?.staffIdentification || '',
        [Validators.required, Validators.minLength(3)]
      ],
      fullName: [
        data?.fullName || '',
        [Validators.required, Validators.minLength(3)]
      ],
      phoneNumber: [
        data?.phoneNumber || '',
        [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]
      ],
      password: this.isEditMode
        ? [''] // 👈 not required in edit mode
        : ['', [Validators.required, Validators.minLength(6)]],
      role: [data?.role || '', Validators.required]
    });
  }

  onSave(): void {
    if (this.staffForm.valid) {
      this.dialogRef.close(this.staffForm.value);
    } else {
      this.staffForm.markAllAsTouched(); // force show validation errors
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
