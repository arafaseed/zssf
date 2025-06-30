import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditVenueComponentComponent } from '../../edit-venue-component/edit-venue-component.component';
import { HttpClient } from '@angular/common/http';
import { ViewVenueService } from '../../Services/view-venue.service';

@Component({
  selector: 'app-view-venues',
  templateUrl: './view-venues.component.html',
  standalone:false,
  styleUrls: ['./view-venues.component.css']
})
export class ViewVenuesComponent implements OnInit {

  venues: any[] = [];
  displayedColumns: string[] = ['venueName', 'capacity', 'description', 'leasePackages', 'addStaff', 'actions'];
  staffList: any[] = [];
  selectedVenueId: number | null = null;

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

        // Load lease packages for each venue
        this.venues.forEach(venue => {
          this.http.get<any[]>(`http://localhost:8080/api/lease-packages/venue/${venue.venueId}`).subscribe({
            next: (packages) => venue.leasePackages = packages,
            error: (error) => {
              console.error(`Error loading packages for venue ${venue.venueId}:`, error);
              venue.leasePackages = [];
            }
          });
        });
      },
      error: (error) => {
        this.showToast('Error fetching venues: ' + error.message, 'error');
      }
    });
  }

  editVenue(venueId: number): void {
    const dialogRef = this.dialog.open(EditVenueComponentComponent, {
      width: '500px',
      data: { venueId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadVenues();
        this.showToast('Venue updated successfully!', 'success');
      }
    });
  }

  toggleStaffList(venueId: number): void {
    if (this.selectedVenueId === venueId) {
      this.selectedVenueId = null;
      return;
    }

    this.selectedVenueId = venueId;
    this.staffList = []; // clear previous data

    this.http.get<any[]>('http://localhost:8080/api/staff/all').subscribe({
      next: (data) => {
        this.staffList = data;
        console.log('Staff list loaded:', this.staffList);
      },
      error: (error) => {
        console.error('Failed to fetch staff list:', error);
        this.showToast('Failed to load staff list', 'error');
      }
    });
  }

  assignStaff(staffId: number, venueId: number): void {
    const payload = { venueId };

    console.log(`Assigning staff ${staffId} to venue ${venueId}`);
    this.http.post(`http://localhost:8080/api/staff/assign-venue/${staffId}`, payload).subscribe({
      next: () => {
        console.log(`Staff ${staffId} assigned to venue ${venueId}`);
        this.showToast('Staff assigned to venue!', 'success');
        this.selectedVenueId = null;
      },
      error: (error) => {
        console.error('Failed to assign staff:', error);
        this.showToast('Failed to assign staff', 'error');
      }
    });
  }

  deleteVenue(venueId: number): void {
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
      panelClass: type === 'success' ? 'snackbar-success' :
                 type === 'error' ? 'snackbar-error' : 'snackbar-info'
    });
  }
}
