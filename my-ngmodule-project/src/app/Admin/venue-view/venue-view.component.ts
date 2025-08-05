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
  venues: any[] = [];
  filteredVenues: any[] = [];
  currentSlideIndices: number[] = [];
  activities: any[] = [];
  groupedVenuesByBuilding: { [buildingId: string]: { buildingName: string, venues: any[] } } = {};

  searchVenue: string = '';
  searchActivity: string = '';
  searchCapacity: number | null = null;
  searchDate: string = '';


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
    this.searchVenue = '';
    this.searchActivity = '';
    this.searchCapacity = null;
    this.filteredVenues = [];
    this.venues = [];
  }

  isNumber(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value);
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
          venueImages: venue.venueImages || [],
          price: null,
          buildingName: 'Loading...'
        }));

        this.venues.forEach((venue, index) => {
          this.venueService.getLeasePackagesByVenue(venue.venueId).subscribe(leasePackages => {
            if (leasePackages.length > 0) {
              const prices = leasePackages.map(lp => lp.price);
              this.venues[index].price = Math.min(...prices);
            } else {
              this.venues[index].price = 'N/A';
            }
          });

          if (venue.buildingId) {
            this.venueService.getBuildingById(venue.buildingId).subscribe({
              next: (buildingData: any) => {
                this.venues[index].buildingName = buildingData.buildingName;
                this.groupVenues();
              },
              error: () => {
                this.venues[index].buildingName = 'Unknown';
                this.groupVenues();
              }
            });
          } else {
            this.venues[index].buildingName = 'Not Assigned';
            this.groupVenues();
          }
        });

        this.filteredVenues = [...this.venues];
        this.currentSlideIndices = new Array(this.venues.length).fill(0);
      });
    });
  }

  groupVenues() {
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
    const venueTerm = this.searchVenue?.trim().toLowerCase() || '';
    const activityTerm = this.searchActivity?.trim().toLowerCase() || '';
    const capacity = this.searchCapacity;

    this.venues = this.filteredVenues.filter((venue) => {
      const matchesVenue =
        venue.venueName.toLowerCase().includes(venueTerm) ||
        venue.buildingName.toLowerCase().includes(venueTerm);

      const matchesActivity = activityTerm
        ? venue.activityNames?.some((a: string) =>
            a.toLowerCase().includes(activityTerm)
          )
        : true;

      const matchesCapacity = capacity
        ? +venue.capacity >= +capacity
        : true;

      return matchesVenue && matchesActivity && matchesCapacity;
    });

    this.groupVenues();
  }

  clearSearch(): void {
    this.searchVenue = '';
    this.searchActivity = '';
    this.searchCapacity = null;
    this.venues = [...this.filteredVenues];
    this.groupVenues();
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

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      this.router.navigate(['/login']);
    }
  }
}
