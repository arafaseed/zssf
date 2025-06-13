import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../Services/activity.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activitytable',
  standalone: false,
  templateUrl: './activitytable.component.html',
  styleUrl: './activitytable.component.css'
})
export class ActivityTableComponent implements OnInit {
openEditModal(activityId: number): void {
  console.log('Edit modal opened for activity:', activityId);
  // TODO: implement the edit modal later
}


  activities: any[] = [];
displayedColumns: string[] = ['activityName', 'activityDescription', 'venueId', 'actions'];

  constructor(
    private activityService: ActivityService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities() {
    this.activityService.getAllActivities().subscribe(data => {
      console.log('Activities loaded:', data); 
      this.activities = data;
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

  // openEditModal(activityId: number): void {
  //   const dialogRef = this.dialog.open(ActivityEditFormComponent, {
  //     width: '500px',
  //     data: { activityId }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.loadActivities();
  //     }
  //   });
  // }
}
