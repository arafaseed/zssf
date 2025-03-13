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
selectVenue(_t49: any) {
throw new Error('Method not implemented.');
}
  
  venues: any[] = [];
  currentSlideIndices: number[] = []; // Tracks the current slide index for each venue
  slideInterval: any; // Store the interval ID for auto-sliding
  searchTerm: string = ''; 
  filteredVenues: any[] | undefined;
  searchQuery: string | undefined;
  
  constructor(private venueService: ViewVenueService, private router: Router) {}

  ngOnInit(): void {
    this.loadVenues();
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  loadVenues(): void {
    this.venueService.getAllVenues().subscribe((data: any[]) => {
      this.venues = data.map(venue => ({
        ...venue,
        showDescription: false,
        venueImages: venue.venueImages || []
      }));

      this.filteredVenues = [...this.venues]; // Initialize filtered venues
      this.currentSlideIndices = new Array(this.venues.length).fill(0);
    });
  }

  startAutoSlide() {
    this.slideInterval = setInterval(() => {
      this.venues.forEach((venue, index) => {
        if (venue.venueImages?.length) {
          this.currentSlideIndices[index] = (this.currentSlideIndices[index] + 1) % venue.venueImages.length;
        }
      });
    }, 3000);
  }
  clearSearch(): void {
    this.searchQuery = '';
    this.filterVenues();
  }
  filterVenues() {
    throw new Error('Method not implemented.');
  }
  

  toggleDescription(venue: any): void {
    venue.showDescription = !venue.showDescription;
  }

  goToBookingPage(venue: any): void {
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


  searchVenues(): void {
    if (this.searchTerm) {
      this.venueService.searchVenuesByName(this.searchTerm).subscribe((data: any[]) => {
        this.venues = data.map(venue => ({
          ...venue,
          showDescription: false,
          venueImages: venue.venueImages || []
        }));
        this.currentSlideIndices = new Array(this.venues.length).fill(0);
      });
    } else {
      this.loadVenues(); // Reload all venues if search term is empty
    }
  }
}
