import { Component, OnInit, OnDestroy, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { ViewVenueService } from '../../Services/view-venue.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-venue-view',
  standalone: false,
  templateUrl: './venue-view.component.html',
  styleUrls: ['./venue-view.component.css']
})
export class VenueViewComponent implements OnInit, OnDestroy {
  @ViewChild('imageViewer') imageViewer!: TemplateRef<any>;

  searchTerm: string = '';
  venues: any[] = [];
  filteredVenues: any[] = [];
  currentSlideIndices: number[] = [];
  selectedImages: string[] = [];
  currentImageIndex: number = 0;

  constructor(
    private venueService: ViewVenueService, 
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadVenues();
  }

  ngOnDestroy() {
    // Cleanup if needed
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

  // toggleDescription(venue: any): void {
  //   venue.showDescription = !venue.showDescription;
  //   const venueCard = document.getElementById(`venue-card-${venue.venueId}`);
  //   if (venueCard) {
  //     venueCard.classList.toggle('expanded');
  //   }
  // }

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
        (this.currentSlideIndices[index] + 1) % 
        this.venues[index].venueImages.length;
    }
  }

  openImageViewer(images: string[], index: number): void {
    this.selectedImages = images;
    this.currentImageIndex = index;

    this.dialog.open(this.imageViewer, {
      panelClass: 'image-viewer-dialog',
      width: '90vw',
      height: '60vh',
      // Optional: disableClose: true,
    });
  }

  prevImage(): void {
    if (this.selectedImages.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.selectedImages.length) % this.selectedImages.length;
    }
  }

  nextImage(): void {
    if (this.selectedImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedImages.length;
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
