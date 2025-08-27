import {
  Component,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';
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
  venues: any[] = [];
  filteredVenues: any[] = [];
  currentSlideIndices: number[] = [];
  activities: any[] = [];
  buildings: string[] = [];
  groupedVenuesByBuilding: { [buildingId: string]: { buildingName: string, venues: any[] } } = {};

  searchActivity: string = '';
  searchDate: string = '';
  searchBuilding: string = '';

  private routerSubscription?: Subscription;

  constructor(
    private venueService: ViewVenueService,
    private router: Router,
    private http: HttpClient
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
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
    this.searchActivity = '';
    this.searchDate = '';
    this.searchBuilding = '';
    this.filteredVenues = [];
    this.venues = [];
  }

  loadActivitiesAndVenues(): void {
    this.http.get<any[]>('/api/activities').subscribe((activityData) => {
      this.activities = activityData;

      this.venueService.getAllVenues().subscribe((venueData: any[]) => {
        const buildingSet = new Set<string>();

        this.venues = venueData.map((venue) => {
          const matchedActivities = this.activities
            .filter(a => a.venueId === venue.venueId)
            .map(a => a.activityName);

          const venueCopy = {
            ...venue,
            activityNames: matchedActivities,
            venueImages: venue.venueImages || [],
            buildingName: 'Loading...',
            price: null
          };

          if (venue.buildingId) {
            this.venueService.getBuildingById(venue.buildingId).subscribe({
              next: (buildingData: any) => {
                venueCopy.buildingName = buildingData.buildingName;
                buildingSet.add(buildingData.buildingName);
                this.groupVenues();
                this.buildings = Array.from(buildingSet).sort();
              },
              error: () => {
                venueCopy.buildingName = 'Unknown';
                this.groupVenues();
              }
            });
          } else {
            venueCopy.buildingName = 'Not Assigned';
          }

          this.venueService.getLeasePackagesByVenue(venue.venueId).subscribe(leasePackages => {
            if (leasePackages.length > 0) {
              const prices = leasePackages.map(lp => lp.price);
              venueCopy.price = Math.min(...prices);
            } else {
              venueCopy.price = 'N/A';
            }
          });

          return venueCopy;
        });

        this.filteredVenues = [...this.venues];
        this.currentSlideIndices = new Array(this.venues.length).fill(0);
        this.groupVenues();
      });
    });
  }

  groupVenues(): void {
    this.groupedVenuesByBuilding = {};
    this.venues.forEach(venue => {
      const buildingId = venue.buildingId || 'No Building';
      if (!this.groupedVenuesByBuilding[buildingId]) {
        this.groupedVenuesByBuilding[buildingId] = {
          buildingName: venue.buildingName || 'Unknown',
          venues: []
        };
      }
      this.groupedVenuesByBuilding[buildingId].venues.push(venue);
    });
  }

  searchVenues(): void {
    if (this.searchDate) {
      this.loadAvailableVenuesByDate(this.searchDate);
    } else {
      const activityTerm = this.searchActivity?.trim().toLowerCase() || '';
      const buildingTerm = this.searchBuilding?.trim().toLowerCase() || '';

      this.venues = this.filteredVenues.filter((venue) => {
        const matchesActivity = activityTerm
          ? venue.activityNames?.some((a: string) => a.toLowerCase().includes(activityTerm))
          : true;

        const matchesBuilding = buildingTerm
          ? venue.buildingName?.toLowerCase() === buildingTerm
          : true;

        return matchesActivity && matchesBuilding;
      });

      this.groupVenues();
    }
  }

  loadAvailableVenuesByDate(date: string): void {
    this.http.get<any>(`/api/bookings/list-available-venues?date=${date}`)
      .subscribe((response) => {
        const availableVenues = response.venues;

        this.venues = availableVenues.map((venue: any) => {
          const matchedActivities = this.activities
            .filter(a => a.venueId === venue.venueId)
            .map(a => a.activityName);

          const venueCopy = {
            ...venue,
            activityNames: matchedActivities,
            venueImages: venue.venueImages || [],
            buildingName: 'Loading...',
            price: null
          };

          if (venue.buildingId) {
            this.venueService.getBuildingById(venue.buildingId).subscribe({
              next: (buildingData: any) => {
                venueCopy.buildingName = buildingData.buildingName;
                this.groupVenues();
              },
              error: () => {
                venueCopy.buildingName = 'Unknown';
                this.groupVenues();
              }
            });
          } else {
            venueCopy.buildingName = 'Not Assigned';
          }

          this.venueService.getLeasePackagesByVenue(venue.venueId).subscribe(leasePackages => {
            if (leasePackages.length > 0) {
              const prices = leasePackages.map(lp => lp.price);
              venueCopy.price = Math.min(...prices);
            } else {
              venueCopy.price = 'N/A';
            }
          });

          return venueCopy;
        });

        this.filteredVenues = [...this.venues];
        this.currentSlideIndices = new Array(this.venues.length).fill(0);
        this.groupVenues();
      });
  }

  clearSearch(): void {
    this.searchActivity = '';
    this.searchDate = '';
    this.searchBuilding = '';
    this.loadActivitiesAndVenues();
  }

  goToBookingPage(venue: any): void {
    this.router.navigate(['/book'], {
      queryParams: {
        venueId: venue.venueId,
        buildingId: venue.buildingId
      }
    });
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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      this.router.navigate(['/login']);
    }
  }

  isNumber(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
}


