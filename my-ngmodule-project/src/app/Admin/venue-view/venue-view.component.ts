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
  searchTerm: string = ''; // Search term to bind with the input
  venues: any[] = [];
  filteredVenues: any[] = [];
  currentSlideIndices: number[] = []; // Tracks the current slide index for each venue
  slideInterval: any; // Store the interval ID for auto-sliding

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
    }, 3000); // Adjust interval for auto sliding
  }

  toggleDescription(venue: any): void {
    venue.showDescription = !venue.showDescription;
    const venueCard = document.getElementById(`venue-card-${venue.venueId}`);
    if (venueCard) {
      venueCard.classList.toggle('expanded'); // Toggle the expanded class for card size change
    }
  }

  goToBookingPage(venue: any): void {
<<<<<<< HEAD
    this.router.navigate(['/book'], { 
      queryParams: { 
        venue_id: venue.venueId, 
        description: venue.description 
      } 
    });
=======
    localStorage.setItem('venueId', venue.venueId);
    this.router.navigate(['/booking']);
>>>>>>> 7fc9e259154e17d65b57f0be0cdf2b214d97aa10
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
    if (this.searchTerm.trim()) {
      this.venues = this.filteredVenues.filter((venue) =>
        venue.venueName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.venues = [...this.filteredVenues]; // Reset to original list
    }
  }

  clearSearch(): void {
    this.searchTerm = ''; 
    this.venues = [...this.filteredVenues]; // Reset to original list
  }
}
