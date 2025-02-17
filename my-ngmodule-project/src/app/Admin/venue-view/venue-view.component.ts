import { Component, OnInit } from '@angular/core';
import { ViewVenueService } from '../../view-venue.service';
import { Router } from '@angular/router';  // Import Router for navigation

@Component({
  selector: 'app-venue-view',
  standalone: false,
  templateUrl: './venue-view.component.html',
  styleUrls: ['./venue-view.component.css']
})
export class VenueViewComponent implements OnInit {

  venues: any[] = [];
  selectedVenue: any;
  currentImageIndex: number = 0;

  constructor(private venueService: ViewVenueService, private router: Router) {}

  ngOnInit(): void {
    this.loadVenues();
  }

  loadVenues(): void {
    this.venueService.getAllVenues().subscribe((data: any[]) => {
      this.venues = data;
    });
  }

  openGallery(venue: any): void {
    this.selectedVenue = venue;
    this.currentImageIndex = 0; // Start with the first image
  }

  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.selectedVenue.venueImages.length - 1; // Loop to the last image
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.selectedVenue.venueImages.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0; // Loop to the first image
    }
  }

  bookVenue(venue: any): void {
    // Navigate to booking page with the venue ID as a route parameter
    this.router.navigate(['/booking', venue.venueId]);  // Assuming /booking/:id route in your Angular routing configuration
  }
  
}
