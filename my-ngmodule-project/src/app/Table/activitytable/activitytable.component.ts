import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../../Services/activity.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ActivityEditFormComponent } from '../../Form/activity-edit-form/activity-edit-form.component';

@Component({
  selector: 'app-activitytable',
  standalone: false,
  templateUrl: './activitytable.component.html',
  styleUrl: './activitytable.component.css'
})
export class ActivityTableComponent implements OnInit {

  activities: any[] = [];
  venues: any[] = [];
 displayedColumns: string[] = ['activityName', 'description', 'venueName', 'actions'];


  constructor(
    private activityService: ActivityService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadVenues();
    this.loadActivities();
  }

  loadVenues() {
  this.activityService.getVenues().subscribe(venuesData => {
    this.venues = venuesData;

    // Load activities AFTER venues are available
    this.activityService.getAllActivities().subscribe(activitiesData => {
      this.activities = activitiesData.map((activity: any) => {
        const venue = this.venues.find(v => v.venueId === activity.venueId);
        return {
          ...activity,
          venueName: venue ? venue.venueName : 'Unknown',
          description: activity.description ? activity.description : 'No description'
        };
      });
      console.log('Activities loaded:', this.activities);
    });
  });
}

  loadActivities() {
    this.activityService.getAllActivities().subscribe(data => {
      // Map venueId to venueName
      this.activities = data.map((activity: any) => {
        const venue = this.venues.find(v => v.venueId === activity.venueId);
        return {
          ...activity,
          venueName: venue ? venue.venueName : 'Unknown',
          description: activity.description || 'No description' // fallback
        };
      });
      console.log('Activities loaded:', this.activities);
    }, error => {
      console.error('Error loading activities:', error);
    });
  }

  deleteActivity(id: number): void {
    const confirmDelete = window.confirm('Are you sure you want to delete this activity?');
    if (confirmDelete) {
      this.activityService.deleteActivity(id).subscribe(() => {
        this.loadActivities();
      }, (error: any) => {
        console.error('Error deleting activity:', error);
      });
    }
  }

  openEditModal(activityId: number): void {
    const dialogRef = this.dialog.open(ActivityEditFormComponent, {
      width: '500px',
      data: { activityId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadActivities();
      }
    });
  }
}