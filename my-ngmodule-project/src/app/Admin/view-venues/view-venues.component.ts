import { Component, OnInit } from '@angular/core';
import { ViewVenueService } from '../../view-venue.service';
import { Router } from '@angular/router';
import { EditVenueComponentComponent } from '../../edit-venue-component/edit-venue-component.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-view-venues',
  standalone: false,
  templateUrl: './view-venues.component.html',
  styleUrl:'./view-venues.component.css'
})
export class ViewVenuesComponent implements OnInit {
    venues: any[] = [];
    displayedColumns: string[] = ['venueName', 'capacity', 'description', 'leasePackages', 'actions'];
   
  
  
    constructor(private venueService: ViewVenueService, private router: Router, private dialog: MatDialog) {}

    ngOnInit(): void {
      this.loadVenues();
    }
  
    loadVenues(): void {
      this.venueService.getAllVenues().subscribe(
        (data: any[]) => {
          this.venues = data;
        },
        (error: any) => {
          console.error('Error fetching venues:', error);
        }
      );
    }
    // navigateToeditVenue(venueId: number): void { 
    //   this.router.navigate(['/admin/editVenue', venueId]);
    // }
    // editVenue(venueId: number): void {
    //   this.router.navigate(['/admin/regvenues', venueId]);
    // }
    openEditVenueModal(venueId: number): void {
      const dialogRef = this.dialog.open(EditVenueComponentComponent, {
        width: '500px',
        data: { venueId: venueId }
      });
  
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.loadVenues(); // Reload venues if modal was closed with a successful update
        }
      });
    }
  
  
    
    // editVenue(venue: any): void {
    //   // Open modal or navigate to edit page with venue details
    //   console.log("Editing Venue:", venue);
    // }
    deleteVenue(venueId: number) {
      if (confirm("Are you sure you want to delete this venue?")) {
        this.venueService.deleteVenue(venueId).subscribe(
          () => {
            alert("Venue deleted successfully");
            this.loadVenues(); // Refresh venue list after deletion
            window.location.href = window.location.href; 
          },
          error => {
            alert("Error deleting venue: " + error.message);
          }
        );
      }
    }
    
}
