import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../Services/auth.service';
import { VenueStateService } from '../../Services/venue-state.service';

interface Venue {
  venueId: number;
  venueName: string;
}

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  staffIdentification: string = '';
  venues: Venue[] = [];
  activeVenueId: number | null = null;
  errorMessage: string = '';
  loading: boolean = true;

  private staffCheckInterval: any;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private venueState: VenueStateService
  ) {}

  ngOnInit(): void {
    // Start polling until "auth-username" is present in sessionStorage
    this.staffCheckInterval = setInterval(() => this.checkAndFetchVenues(), 1000);
  }

  private checkAndFetchVenues(): void {
    const storedStaffIdentification = sessionStorage.getItem('auth-username');

    if (storedStaffIdentification) {
      // Once we detect a value, stop polling
      clearInterval(this.staffCheckInterval);

      this.staffIdentification = storedStaffIdentification;
      this.fetchVenues(storedStaffIdentification);
    }
  }

  private fetchVenues(staffIdentification: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.http
      .get<Venue[]>(`/api/venues/view-by-staff/${staffIdentification}`)
      .subscribe({
        next: (data) => {
          // Sort by venueId
          this.venues = data.sort((a, b) => a.venueId - b.venueId);

          // Save the full list into sessionStorage
          try {
            sessionStorage.setItem('venues', JSON.stringify(this.venues));
          } catch (e) {
            console.warn('Could not store venues in sessionStorage.', e);
          }

          if (this.venues.length > 0) {
            const storedVenueId = sessionStorage.getItem('activeVenueId');
            if (storedVenueId && this.venues.some(v => v.venueId === +storedVenueId)) {
              this.activeVenueId = +storedVenueId;
            } else {
              this.setActiveVenue(this.venues[0]);
            }
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to fetch venues', err);
          this.errorMessage = 'Unable to load venues. Please try again later.';
          this.loading = false;
        }
      });
  }

  setActiveVenue(venue: Venue): void {
    this.activeVenueId = venue.venueId;
    try {
      sessionStorage.setItem('activeVenueId', venue.venueId.toString());
      sessionStorage.setItem('activeVenueName', venue.venueName);
      this.venueState.notifyVenueChange();
    } catch (e) {
      console.warn('Could not store active venue in sessionStorage.', e);
    }
  }

  isActive(venue: Venue): boolean {
    return this.activeVenueId === venue.venueId;
  }

  logout(): void {
    // Clear sessionStorage keys (optional)
    sessionStorage.removeItem('auth-username');
    sessionStorage.removeItem('venues');
    sessionStorage.removeItem('activeVenueId');
    sessionStorage.removeItem('activeVenueName');

    this.auth.logout();
  }

  ngOnDestroy(): void {
    if (this.staffCheckInterval) {
      clearInterval(this.staffCheckInterval);
    }
  }
}
