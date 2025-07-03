import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ViewVenueService } from '../../Services/view-venue.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-venue-view',
  standalone: false,
  templateUrl: './venue-view.component.html',
  styleUrls: ['./venue-view.component.css']
})
export class VenueViewComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  venues: any[] = [];
  filteredVenues: any[] = [];
  currentSlideIndices: number[] = [];

  // --- Inline Image Viewer state ---
  inlineViewerVisible = false;
  selectedImages: string[] = [];
  currentImageIndex = 0;

  private routerSubscription?: Subscription;

  constructor(
    private venueService: ViewVenueService,
    private router: Router,
  ) {
    // Disable route reuse to force component refresh on navigation
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    // Optionally scroll to top on navigation end
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo(0, 0);
        // Reset search and other states if needed here
        this.resetState();
      });
  }

  ngOnInit(): void {
    this.loadVenues();
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  private resetState() {
    this.searchTerm = '';
    this.inlineViewerVisible = false;
    this.selectedImages = [];
    this.currentImageIndex = 0;
    this.currentSlideIndices = [];
    this.filteredVenues = [];
    this.venues = [];
  }

  loadVenues(): void {
    this.venueService.getAllVenues().subscribe((data: any[]) => {
      this.venues = data.map(venue => ({
        ...venue,
        showDescription: false,
        venueImages: venue.venueImages || []
      }));
      this.filteredVenues = [...this.venues];
      this.currentSlideIndices = new Array(this.venues.length).fill(0);
    });
  }

  goToBookingPage(venue: any): void {
    this.router.navigate(['/book'], { queryParams: { venueId: venue.venueId } });
  }

  prevSlide(index: number): void {
    if (this.venues[index].venueImages?.length) {
      this.currentSlideIndices[index] =
        (this.currentSlideIndices[index] - 1 + this.venues[index].venueImages.length) %
        this.venues[index].venueImages.length;
    }
  }

  nextSlide(index: number): void {
    if (this.venues[index].venueImages?.length) {
      this.currentSlideIndices[index] =
        (this.currentSlideIndices[index] + 1) % this.venues[index].venueImages.length;
    }
  }

  openInlineImageViewer(images: string[], index: number): void {
    this.selectedImages = images;
    this.currentImageIndex = index;
    this.inlineViewerVisible = true;
   
  }

  closeInlineImageViewer(): void {
    this.inlineViewerVisible = false;
    this.selectedImages = [];
    document.body.style.overflow = 'auto';
    this.router.navigate(['/']);  
  }

  prevInlineImage(): void {
    if (this.selectedImages.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.selectedImages.length) % this.selectedImages.length;
    }
  }

  nextInlineImage(): void {
    if (this.selectedImages.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.selectedImages.length;
    }
  }

  goToSlide(venueIndex: number, slideIndex: number): void {
    this.currentSlideIndices[venueIndex] = slideIndex;
  }

  searchVenues(): void {
    if (this.searchTerm.trim()) {
      this.venues = this.filteredVenues.filter((venue) =>
        venue.venueName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        venue.capacity.toString().includes(this.searchTerm.trim())
      );
    } else {
      this.venues = [...this.filteredVenues];
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.venues = [...this.filteredVenues];
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      this.router.navigate(['/login']);
    }
  }

}
