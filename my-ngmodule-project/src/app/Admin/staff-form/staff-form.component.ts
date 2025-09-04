import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { StaffViewService } from '../../Services/staff-view.service';

@Component({
  selector: 'app-staff-form',
  templateUrl: './staff-form.component.html',
  standalone: false,
  styleUrls: ['./staff-form.component.css']
})
export class StaffFormComponent implements OnInit {
  staffForm!: FormGroup;
  roles: string[] = ['ADMIN','STAFF']; 
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private staffService: StaffViewService,
    private router: Router,
    @Optional() private dialogRef?: MatDialogRef<StaffFormComponent>
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.staffForm = this.fb.group({
      staffIdentification: ['', [Validators.required, Validators.minLength(3)]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]], // Added password
      role: ['', Validators.required],
      assignedVenueIds: [[]]
    });
  }

  onSubmit(): void {
    if (this.staffForm.valid) {
      this.isSubmitting = true;
      this.staffService.createStaff(this.staffForm.value).subscribe(
        () => {
          alert('Staff added successfully');
          if (this.dialogRef) this.dialogRef.close(true);
          else this.router.navigate(['/admin/staff']);
        },
        err => {
          console.error(err);
          alert('Failed to add staff.');
          this.isSubmitting = false;
        }
      );
    } else {
      alert('Please fill out the form correctly.');
    }
  }

  closeDialog(): void {
    if (this.dialogRef) this.dialogRef.close();
    else this.router.navigate(['/admin/staff']);
  }
}
