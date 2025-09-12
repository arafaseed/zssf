// src/app/shared/navbar/navbar.component.ts
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../Services/auth.service';
import { VenueStateService } from '../../Services/venue-state.service';
import { environment } from '../../../environments/environment';

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
  @Input() isExpanded: boolean = true;               // passed by parent (desktop)
  @Input() isMobile: boolean = false;                // tells component it's in mobile mode
  @Output() expandToggle = new EventEmitter<boolean>();

  staffIdentification: string = '';
  venues: Venue[] = [];
  activeVenueId: number | null = null;
  errorMessage: string = '';
  loading: boolean = true;

  private staffCheckInterval: any;

  // nav items (icons from Material icons set)
  navItems = [
    { label: 'Check-Ins', link: '/staff/checkin', icon: 'login' },
    { label: 'Check-Outs', link: '/staff/checkout', icon: 'logout' },
    { label: 'Cancelled', link: '/staff/cancelled', icon: 'block' },
    { label: 'Reports', link: '/staff/reports', icon: 'bar_chart' },
    { label: 'Not Checked-in', link: '/staff/unchecked', icon: 'pending_actions' },
    { label: 'Scan Invoice', link: '/staff/invoice-scanner', icon: 'qr_code_scanner' }
  ];

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private venueState: VenueStateService
  ) {}

  ngOnInit(): void {
    // Poll until auth-username exists in sessionStorage
    this.staffCheckInterval = setInterval(() => this.checkAndFetchVenues(), 800);
  }

  private checkAndFetchVenues(): void {
    const storedStaffIdentification = sessionStorage.getItem('auth-username');
    if (storedStaffIdentification) {
      clearInterval(this.staffCheckInterval);
      this.staffIdentification = storedStaffIdentification;
      this.fetchVenues(storedStaffIdentification);
    }
  }

  private fetchVenues(staffIdentification: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.http
      .get<Venue[]>(`${environment.apiUrl}/api/venues/view-by-staff/${staffIdentification}`)
      .subscribe({
        next: (data) => {
          this.venues = data.sort((a,b) => a.venueId - b.venueId);
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

  onExpandToggle() {
    this.isExpanded = !this.isExpanded;
    this.expandToggle.emit(this.isExpanded);
  }

  logout(): void {
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
