import { Component, Input } from '@angular/core';
import { Venue } from '../../models/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-venue-card',
  standalone: false,
  templateUrl: './venue-card.component.html'
})
export class VenueCardComponent {
  @Input() venue!: Venue;
  @Input() minPrice: number | null = null;

  constructor(private router: Router) {}

  get imageUrl(): string {
    return this.venue?.venueImages?.length ? this.venue.venueImages[0] : '/assets/placeholder.jpg';
  }

  openVenue() {
    this.router.navigate(['/venue', this.venue.venueId]);
  }
}
