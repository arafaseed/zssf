// src/app/components/activity-form/activity-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivityService } from '../../Services/activity.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.css'],
  standalone: false
})
export class ActivityFormComponent implements OnInit {
  activityForm: FormGroup;
  venues: any[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.activityForm = this.fb.group({
      activityName: ['', [Validators.required, Validators.minLength(3)]],
      activityDescription: ['', [Validators.required, Validators.minLength(5)]],
      price: [null, [Validators.required, Validators.min(0)]],
      venueId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.activityService.getVenues().subscribe({
      next: (data) => this.venues = data || [],
      error: (error) => { console.error('Failed to load venues', error); this.showToast('Failed to load venues', 'error'); }
    });
  }

  onSubmit(): void {
    if (this.activityForm.invalid) {
      this.activityForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const form = this.activityForm.value;
    const payload = {
      activityName: form.activityName,
      description: form.activityDescription,
      price: Number(form.price)
    };
    const venueId = Number(form.venueId);

    this.activityService.addActivity(payload, venueId).subscribe({
      next: () => {
        this.showToast('Activity added successfully!', 'success');
        this.activityForm.reset();
        this.isSubmitting = false;
        this.router.navigate(['/admin/activitytable']);
      },
      error: (err) => {
        console.error('Failed to add activity', err);
        this.showToast('Failed to add activity', 'error');
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/activitytable']);
  }

  private showToast(message: string, type: 'success'|'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3500,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
