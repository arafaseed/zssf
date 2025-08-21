import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivityService } from '../../Services/activity.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-activity-edit-form',
  templateUrl: './activity-edit-form.component.html',
  standalone: false,
  styleUrls: ['./activity-edit-form.component.css']
})
export class ActivityEditFormComponent implements OnInit {
  activityForm!: FormGroup;
  venues: any[] = [];
  selectedVenueName: string = '';

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private dialogRef: MatDialogRef<ActivityEditFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { activityId: number }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadVenues();

    if (this.data.activityId) {
      this.loadActivityDetails(this.data.activityId);
    }
  }

  initializeForm(): void {
    this.activityForm = this.fb.group({
      activityName: ['', [Validators.required, Validators.minLength(3)]],
      activityDescription: ['', [Validators.required, Validators.minLength(5)]],
      venueId: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]]
    });
  }

  loadVenues(): void {
    this.activityService.getVenues().subscribe(
      (data: any[]) => {
        this.venues = data;
      },
      (error: any) => {
        console.error('Error loading venues:', error);
        alert('Failed to load venues.');
      }
    );
  }

  loadActivityDetails(activityId: number): void {
    this.activityService.getActivityById(activityId).subscribe(
      (activity: any) => {
        this.activityForm.patchValue({
          activityName: activity.activityName,
          activityDescription: activity.activityDescription,
          venueId: activity.venueId,
          price: activity.price
        });
      },
      (error: HttpErrorResponse) => {
        console.error('Error loading activity:', error);
        alert('Failed to load activity details.');
      }
    );
  }

  onSubmit(): void {
    if (this.activityForm.valid) {
      const updatedActivity = {
        ...this.activityForm.value,
        venueId: parseInt(this.activityForm.value.venueId, 10),
        price: parseFloat(this.activityForm.value.price)
      };

      this.activityService.updateActivity(this.data.activityId, updatedActivity).subscribe(
        () => {
          alert('Activity updated successfully!');
          this.dialogRef.close(true);
        },
        (error: HttpErrorResponse) => {
          console.error('Error updating activity:', error);
          alert('Failed to update activity.');
        }
      );
    } else {
      alert('Please fill out the form correctly.');
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
