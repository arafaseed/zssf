import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewVenueService } from '../../view-venue.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-venue-view',
  standalone: false,
  templateUrl: './venue-view.component.html',
  styleUrls: ['./venue-view.component.css']
})
export class VenueViewComponent implements OnInit, OnDestroy {

  venues: any[] = [];
  currentSlideIndices: number[] = []; // Tracks the current slide index for each venue
  slideInterval: any; // Store the interval ID for auto-sliding

  constructor(private venueService: ViewVenueService, private router: Router) {}

  ngOnInit(): void {
    this.loadVenues();
    this.startAutoSlide(); // Start the auto-slide when the component loads
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval); // Clear the interval when the component is destroyed
    }
  }

  loadVenues(): void {
    this.venueService.getAllVenues().subscribe((data: any[]) => {
      this.venues = data.map(venue => ({
        ...venue,
        showDescription: false,
        venueImages: venue.venueImages || [] // Ensure venueImages is an array
      }));

      // Initialize the current slide index for each venue to 0
      this.currentSlideIndices = new Array(this.venues.length).fill(0);
    });
  }

  startAutoSlide() {
    this.slideInterval = setInterval(() => {
      this.venues.forEach((venue, index) => {
        if (venue.venueImages?.length) {
          // Automatically move to the next slide
          this.currentSlideIndices[index] = (this.currentSlideIndices[index] + 1) % venue.venueImages.length;
        }
      });
    }, 3000); // Change slide every 3 seconds
  }

  toggleDescription(venue: any): void {
    venue.showDescription = !venue.showDescription;
  }

  goToBookingPage(venue: any): void {
    // Pass venue_id and description to the booking page
    this.router.navigate(['/booking-form'], { 
      queryParams: { 
        venue_id: venue.venueId, 
        description: venue.description 
      } 
    });
  }
  
  

  prevSlide(index: number): void {
    if (this.venues[index].venueImages?.length) {
      this.currentSlideIndices[index] = (this.currentSlideIndices[index] - 1 + this.venues[index].venueImages.length) % this.venues[index].venueImages.length;
    }
  }

  nextSlide(index: number): void {
    if (this.venues[index].venueImages?.length) {
      this.currentSlideIndices[index] = (this.currentSlideIndices[index] + 1) % this.venues[index].venueImages.length;
    }
  }

  goToSlide(venueIndex: number, slideIndex: number): void {
    this.currentSlideIndices[venueIndex] = slideIndex;
  }
}
