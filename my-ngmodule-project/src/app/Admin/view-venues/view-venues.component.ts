import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { ViewVenueService } from '../../Services/view-venue.service';
import { EditVenueComponent } from '../../edit-venue-component/edit-venue-component.component';

@Component({
  selector: 'app-view-venues',
  standalone: false,
  templateUrl: './view-venues.component.html',
  styleUrls: ['./view-venues.component.css']
})
export class ViewVenuesComponent implements OnInit {
  venues: any[] = [];
  displayedColumns: string[] = [
    'venueName',
    'capacity',
    'description',
    'preview',
    'leasePackages',
    'addStaff',
    'actions'
  ];
  staffList: any[] = [];
  selectedVenueId: number | null = null;

  @ViewChild('previewDialog') previewDialog!: TemplateRef<any>;
  previewDialogData: any = {};
  currentImageIndex: number = 0;

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
  openEditVenueDialog(venueId: number): void {
  const dialogRef = this.dialog.open(EditVenueComponent, {
    width: '600px',
    data: { venueId }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Refresh your venue list or do something after successful update
      this.loadVenues();
    }
  });
}

  loadVenues(): void {
    this.venueService.getAllVenues().subscribe({
      next: (data: any[]) => {
        this.venues = data;

        // Load lease packages for each venue
        this.venues.forEach(venue => {
          this.http
            .get<any[]>(`http://localhost:8080/api/lease-packages/venue/${venue.venueId}`)
            .subscribe({
              next: packages => (venue.leasePackages = packages),
              error: () => (venue.leasePackages = [])
            });
        });

        // Load staff assignments
        this.http.get<any[]>('http://localhost:8080/api/staff/all').subscribe({
          next: staffList => {
            this.venues.forEach(venue => {
              const staff = staffList.find(s => s.assignedVenueIds?.includes(venue.venueId));
              if (staff) {
                venue.assignedStaffId = staff.staffId;
                venue.assignedStaffName = staff.fullName;
                venue.assignedStaffPhone = staff.phoneNumber;
              }
            });
          },
          error: error => console.error('Failed to fetch staff assignments:', error)
        });
      },
      error: error => {
        this.showToast('Error fetching venues: ' + error.message, 'error');
      }
    });
  }

  addVenue(): void {
    this.router.navigate(['/admin/regvenues']);
  }

 editVenue(venueId: number): void {
  // Navigate to the dedicated Edit Venue route
  this.router.navigate(['/admin/editVenue']);
}


  toggleStaffList(venueId: number): void {
    if (this.selectedVenueId === venueId) {
      this.selectedVenueId = null;
      return;
    }

    this.selectedVenueId = venueId;
    this.http.get<any[]>('http://localhost:8080/api/staff/all').subscribe({
      next: data => {
        this.staffList = data;
      },
      error: () => {
        this.showToast('Failed to load staff list', 'error');
      }
    });
  }

  openPreview(images: string[]): void {
    this.previewDialogData = { images };
    this.currentImageIndex = 0;
    this.dialog.open(this.previewDialog, { width: '600px' });
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) this.currentImageIndex--;
  }

  nextImage(): void {
    if (this.currentImageIndex < this.previewDialogData.images.length - 1)
      this.currentImageIndex++;
  }

  assignStaff(staffId: number, venueId: number): void {
    const payload = { venueId };
    this.http
      .post(`http://localhost:8080/api/staff/assign-venue/${staffId}`, payload)
      .subscribe({
        next: () => {
          this.showToast('Staff assigned to venue!', 'success');
          const assignedVenue = this.venues.find(v => v.venueId === venueId);
          if (assignedVenue) {
            const selectedStaff = this.staffList.find(s => s.staffId === staffId);
            assignedVenue.assignedStaffId = staffId;
            assignedVenue.assignedStaffName = selectedStaff?.fullName;
            assignedVenue.assignedStaffPhone = selectedStaff?.phoneNumber;
          }
          this.selectedVenueId = null;
        },
        error: () => this.showToast('Failed to assign staff', 'error')
      });
  }

  deleteVenue(venueId: number): void {
    if (confirm('Are you sure you want to delete this venue?')) {
      this.venueService.deleteVenue(venueId).subscribe({
        next: () => {
          this.showToast('Venue deleted successfully', 'success');
          this.loadVenues();
        },
        error: error =>
          this.showToast('Error deleting venue: ' + error.message, 'error')
      });
    }
  }

  private showToast(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass:
        type === 'success'
          ? 'snackbar-success'
          : type === 'error'
          ? 'snackbar-error'
          : 'snackbar-info'
    });
  }
}
