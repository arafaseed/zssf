import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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

  constructor(private venueService: ViewVenueService, private router: Router) {}

  ngOnInit(): void {
    this.loadVenues();
  }

  ngOnDestroy() {
    // Clean up any resources if needed when the component is destroyed
  }

  loadVenues(): void {
    this.venueService.getAllVenues().subscribe((data: any[]) => {
      this.venues = data.map(venue => ({
        ...venue,
        showDescription: false,
        venueImages: venue.venueImages || []
      }));
      this.filteredVenues = [...this.venues]; // Initialize filtered venues
      this.currentSlideIndices = new Array(this.venues.length).fill(0); // Initialize slide indices
    });
  }

  toggleDescription(venue: any): void {
    venue.showDescription = !venue.showDescription;
    const venueCard = document.getElementById(`venue-card-${venue.venueId}`);
    if (venueCard) {
      venueCard.classList.toggle('expanded'); // Toggle the expanded class for card size change
    }
  }

  goToBookingPage(venue: any): void {
    
    this.router.navigate(['/book'], { queryParams: { venueId: venue.venueId } });

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
        venue.venueName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        venue.capacity.toString().includes(this.searchTerm.trim())  // Check capacity as well
      );
    } else {
      this.venues = [...this.filteredVenues];  // Reset to all venues if search term is empty
    }
  }
  

  clearSearch(): void {
    this.searchTerm = '';
    this.venues = [...this.filteredVenues];
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      this.router.navigate(['/login']); // Adjust route as needed
    }
}
}
