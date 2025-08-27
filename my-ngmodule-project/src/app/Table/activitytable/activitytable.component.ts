// src/app/components/activitytable/activitytable.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../../Services/activity.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ActivityEditFormComponent } from '../../Form/activity-edit-form/activity-edit-form.component';

@Component({
  selector: 'app-activitytable',
  templateUrl: './activitytable.component.html',
  styleUrls: ['./activitytable.component.css'],
  standalone: false
})
export class ActivityTableComponent implements OnInit {
  activities: any[] = [];
  venues: any[] = [];

  constructor(
    private activityService: ActivityService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadVenuesAndActivities();
  }

  loadVenuesAndActivities() {
    this.activityService.getVenues().subscribe({
      next: venuesData => {
        this.venues = venuesData || [];
        this.activityService.getAllActivities().subscribe({
          next: activitiesData => {
            this.activities = (activitiesData || []).map((activity: any) => {
              const venue = this.venues.find(v => v.venueId === activity.venueId);
              return {
                ...activity,
                venueName: venue ? venue.venueName : 'Unknown',
                description: activity.description ?? 'No description'
              };
            });
          },
          error: err => console.error('Error loading activities', err)
        });
      },
      error: err => console.error('Error loading venues', err)
    });
  }

  deleteActivity(id: number): void {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    this.activityService.deleteActivity(id).subscribe({
      next: () => this.loadVenuesAndActivities(),
      error: err => console.error('Error deleting activity', err)
    });
  }

  openEditModal(activityId: number): void {
    const dialogRef = this.dialog.open(ActivityEditFormComponent, {
      width: '520px',
      data: { activityId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadVenuesAndActivities();
    });
  }

  /**
   * Navigate to the "Add Activity" page.
   * This method is required by the template's (click)="goToAdd()".
   */
  goToAdd(): void {
    this.router.navigate(['/admin/activity']);
  }
}
