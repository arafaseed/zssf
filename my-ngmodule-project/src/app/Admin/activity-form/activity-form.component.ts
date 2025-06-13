import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivityService } from '../../Services/activity.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity-form',
  templateUrl: './activity-form.component.html',
  standalone:false,
  styleUrls: ['./activity-form.component.css']
})
export class ActivityFormComponent implements OnInit {
  activityForm: FormGroup;
  venues: any[] = [];

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.activityForm = this.fb.group({
      activityName: ['', [Validators.required, Validators.minLength(3)]],
      activityDescription: ['', [Validators.required, Validators.minLength(5)]],
      venueId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.activityService.getVenues().subscribe({
      next: (data) => this.venues = data,
      error: (error) => this.showToast('Failed to load venues', 'error')
    });
  }

  onSubmit(): void {
    if (this.activityForm.valid) {
      const activity = this.activityForm.value;
      const venueId = parseInt(activity.venueId, 10);

      this.activityService.addActivity(activity, venueId).subscribe({
        next: () => {
          this.showToast('Activity added successfully!', 'success');
          this.activityForm.reset();
          this.router.navigate(['/admin/activitytable']); // Optional route
        },
        error: (err) => this.showToast('Failed to add activity: ' + err.message, 'error')
      });
    }
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}
