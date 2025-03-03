import { Component, OnInit } from '@angular/core';
import { ViewVenueService } from '../../view-venue.service';

@Component({
  selector: 'app-view-venues',
  standalone: false,
  templateUrl: './view-venues.component.html',
  styleUrl:'./view-venues.component.css'
})
export class ViewVenuesComponent implements OnInit {
    venues: any[] = [];
    displayedColumns: string[] = ['venueName', 'capacity', 'description', 'leasePackages', 'actions'];
  
    constructor(private venueService: ViewVenueService) {}

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

    

    editVenue(venue: any): void {
      // Open modal or navigate to edit page with venue details
      console.log("Editing Venue:", venue);
    }
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
