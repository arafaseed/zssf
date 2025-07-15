import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ViewVenueService } from '../../Services/view-venue.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-venue-view',
  standalone: false,
  templateUrl: './venue-view.component.html',
  styleUrls: ['./venue-view.component.css']
})
export class VenueViewComponent implements OnInit, OnDestroy {
isNumber(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

  searchTerm: string = '';
  venues: any[] = [];
  filteredVenues: any[] = [];
  currentSlideIndices: number[] = [];
  activities: any[] = [];

  // --- Inline Image Viewer state ---
  inlineViewerVisible = false;
  selectedImages: string[] = [];
  currentImageIndex = 0;

  private routerSubscription?: Subscription;

  constructor(
    private venueService: ViewVenueService,
    private router: Router,
    private http: HttpClient
  ) {
    // Disable route reuse to force component refresh on navigation
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    // Scroll to top on navigation
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo(0, 0);
        this.resetState();
      });
  }

  ngOnInit(): void {
    this.loadActivitiesAndVenues();
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

  loadActivitiesAndVenues(): void {
  this.http.get<any[]>('http://localhost:8080/api/activities').subscribe((activityData) => {
    this.activities = activityData;

    this.venueService.getAllVenues().subscribe((venueData: any[]) => {
      this.venues = venueData.map(venue => ({
        ...venue,
        activityNames: this.activities
          .filter(a => a.venueId === venue.venueId)
          .map(a => a.activityName),
        showDescription: false,
        venueImages: venue.venueImages || [],
        price: null  // Initialize price as null
      }));

      // For each venue, get lease packages and find lowest price
      this.venues.forEach((venue, index) => {
        this.venueService.getLeasePackagesByVenue(venue.venueId).subscribe(leasePackages => {
          if (leasePackages.length > 0) {
            const prices = leasePackages.map(lp => lp.price);
            const lowestPrice = Math.min(...prices);
            this.venues[index].price = lowestPrice;
          } else {
            this.venues[index].price = 'N/A';
          }
        });
      });

      this.filteredVenues = [...this.venues];
      this.currentSlideIndices = new Array(this.venues.length).fill(0);
    });
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
    const term = this.searchTerm.trim().toLowerCase();

    if (term) {
      this.venues = this.filteredVenues.filter((venue) =>
        venue.venueName.toLowerCase().includes(term) ||
        venue.capacity.toString().includes(term) ||
        (venue.activityNames && venue.activityNames.some((name: string) =>
          name.toLowerCase().includes(term)
        ))
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
