import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditVenueComponentComponent } from '../../edit-venue-component/edit-venue-component.component';
import { HttpClient } from '@angular/common/http';
import { ViewVenueService } from '../../Services/view-venue.service';

@Component({
  selector: 'app-view-venues',
  standalone: false,
  templateUrl: './view-venues.component.html',
  styleUrls: ['./view-venues.component.css']
})
export class ViewVenuesComponent implements OnInit {
  venues: any[] = [];
  displayedColumns: string[] = ['venueName', 'capacity', 'description', 'leasePackages', 'actions'];

  constructor(
    private venueService: ViewVenueService,
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadVenues();
  }

  loadVenues(): void {
    this.venueService.getAllVenues().subscribe({
      next: (data: any[]) => {
        this.venues = data;

        // Fetch lease packages for each venue
        this.venues.forEach(venue => {
          this.http.get<any[]>(`http://localhost:8080/api/lease-packages/venue/${venue.venueId}`).subscribe({
            next: (packages) => {
              venue.leasePackages = packages;
            },
            error: (error) => {
              console.error(`Error fetching packages for venue ${venue.venueId}:`, error);
              venue.leasePackages = []; // Assign empty array to avoid undefined
            }
          });
        });
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
    this.openEditVenueModal(venueId);
  }

  deleteVenue(venueId: number) {
    if (confirm("Are you sure you want to delete this venue?")) {
      this.venueService.deleteVenue(venueId).subscribe({
        next: () => {
          this.showToast("Venue deleted successfully", 'success');
          this.loadVenues();
        },
        error: (error) => {
          this.showToast("Error deleting venue: " + error.message, 'error');
        }
      });
    }
  }

  private showToast(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : type === 'error' ? 'snackbar-error' : 'snackbar-info'
    });
  }
}
