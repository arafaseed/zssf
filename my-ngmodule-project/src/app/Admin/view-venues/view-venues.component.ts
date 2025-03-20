import { Component, OnInit } from '@angular/core';
import { ViewVenueService } from '../../view-venue.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditVenueComponentComponent } from '../../edit-venue-component/edit-venue-component.component';

@Component({
  selector: 'app-view-venues',
  standalone: false,
  templateUrl: './view-venues.component.html',
  styleUrls: ['./view-venues.component.css']
})
export class ViewVenuesComponent implements OnInit {
  venues: any[] = [];
  displayedColumns: string[] = ['venueName', 'capacity', 'description', 'leasePackages', 'building', 'actions'];

  constructor(
    private venueService: ViewVenueService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadVenues();
  }

  loadVenues(): void {
    this.venueService.getAllVenues().subscribe({
      next: (data: any[]) => {
        this.venues = data;
        this.showToast('Venues loaded successfully!', 'success');
      },
      error: (error) => {
        this.showToast('Error fetching venues: ' + error.message, 'error');
      }
    });
  }

  openEditVenueModal(venueId: number): void {
    const dialogRef = this.dialog.open(EditVenueComponentComponent, {
      width: '500px',
      data: { venueId: venueId }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.loadVenues();
        this.showToast('Venue updated successfully!', 'success');
      }
    });
  }

  editVenue(venueId: number): void {
    this.openEditVenueModal(venueId); // Open the edit modal when edit button is clicked
  }

  deleteVenue(venueId: number) {
    if (confirm("Are you sure you want to delete this venue?")) {
      this.venueService.deleteVenue(venueId).subscribe({
        next: () => {
          this.showToast("Venue deleted successfully", 'success');
          this.loadVenues(); // Refresh venue list after deletion
        },
        error: (error) => {
          this.showToast("Error deleting venue: " + error.message, 'error');
        }
      });
    }
  }

  // Snackbar Notification
  private showToast(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : type === 'error' ? 'snackbar-error' : 'snackbar-info'
    });
  }
}
