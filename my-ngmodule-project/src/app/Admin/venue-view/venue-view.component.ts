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
  filteredVenues: any[] = []; // Stores filtered venues based on search
  currentSlideIndices: number[] = [];
  slideInterval: any;
  searchQuery: string = ''; // Holds search input value

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

  // 🔍 Search Functionality
  filterVenues(): void {
    this.filteredVenues = this.venues.filter(venue =>
      venue.venueName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
    // ✅ Fix: Add selectVenue() method
    selectVenue(venue: any) {
      localStorage.setItem('selectedVenue', JSON.stringify(venue));
      this.router.navigate(['/booking']);
    }
}
