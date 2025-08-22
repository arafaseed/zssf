// src/app/components/activity-edit-form/activity-edit-form.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivityService } from '../../Services/activity.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-activity-edit-form',
  templateUrl: './activity-edit-form.component.html',
  styleUrls: ['./activity-edit-form.component.css'],
  standalone: false
})
export class ActivityEditFormComponent implements OnInit {
  activityForm!: FormGroup;
  venues: any[] = [];

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private dialogRef: MatDialogRef<ActivityEditFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { activityId: number }
  ) {}

  ngOnInit(): void {
    this.activityForm = this.fb.group({
      activityName: ['', [Validators.required, Validators.minLength(3)]],
      activityDescription: ['', [Validators.required, Validators.minLength(5)]],
      price: [null, [Validators.required, Validators.min(0)]],
      venueId: ['', Validators.required]
    });

    this.loadVenues();

    if (this.data?.activityId) {
      this.activityService.getActivityById(this.data.activityId).subscribe({
        next: (activity) => {
          if (!activity) {
            alert('Activity not found');
            this.dialogRef.close(false);
            return;
          }
          this.activityForm.patchValue({
            activityName: activity.activityName,
            activityDescription: activity.description,
            price: activity.price,
            venueId: activity.venueId ?? ''
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading activity:', err);
          alert('Failed to load activity details.');
          this.dialogRef.close(false);
        }
      });
    }
  }

  loadVenues(): void {
    this.activityService.getVenues().subscribe({
      next: v => this.venues = v || [],
      error: err => { console.error('Failed loading venues', err); this.venues = []; }
    });
  }

  onSubmit(): void {
    if (this.activityForm.invalid) {
      this.activityForm.markAllAsTouched();
      return;
    }

    const form = this.activityForm.value;
    const payload = {
      activityName: form.activityName,
      description: form.activityDescription,
      price: Number(form.price)
    };

    this.activityService.updateActivity(this.data.activityId, payload).subscribe({
      next: () => {
        alert('Activity updated successfully!');
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating activity:', err);
        alert('Failed to update activity.');
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
