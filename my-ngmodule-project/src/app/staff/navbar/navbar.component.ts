import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
export class NavbarComponent implements OnDestroy {
  staffIDN: string = '';
  venues: Venue[] = [];
  activeVenueId: number | null = null;

  private staffCheckInterval: any;

  constructor(private http: HttpClient) {
    this.staffCheckInterval = setInterval(() => this.checkAndFetchVenues(), 1000); // Check every second
  }

  checkAndFetchVenues(): void {
    const storedStaffIDN = localStorage.getItem('staffIDN');

    // If not yet fetched and valid staffIDN is present
    if (!this.staffIDN && storedStaffIDN) {
      this.staffIDN = storedStaffIDN;
      this.fetchVenues(storedStaffIDN);
    }
  }

  fetchVenues(staffIDN: string): void {
    this.http.get<Venue[]>(`http://localhost:8080/api/venues/view-by-staff/${staffIDN}`)
      .subscribe({
        next: (data) => {
          this.venues = data.sort((a, b) => a.venueId - b.venueId);
          if (this.venues.length > 0) {
            const storedVenueId = localStorage.getItem('activeVenueId');
            if (storedVenueId && this.venues.some(v => v.venueId === +storedVenueId)) {
              this.activeVenueId = +storedVenueId;
            } else {
              this.setActiveVenue(this.venues[0]);
            }
          }
        },
        error: (err) => console.error('Failed to fetch venues', err),
        complete: () => {
          clearInterval(this.staffCheckInterval); // Stop checking once fetched
        }
      });
  }

  setActiveVenue(venue: Venue): void {
    this.activeVenueId = venue.venueId;
    localStorage.setItem('activeVenueId', venue.venueId.toString());
    localStorage.setItem('activeVenueName', venue.venueName);
  }

  isActive(venue: Venue): boolean {
    return this.activeVenueId === venue.venueId;
  }

  ngOnDestroy(): void {
    if (this.staffCheckInterval) {
      clearInterval(this.staffCheckInterval);
    }
  }
}
