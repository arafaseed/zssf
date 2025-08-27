import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { Building, Venue, Activity } from '../../models/models';
import { BuildingService } from '../../Services/building.service';
import { ActivityService } from '../../Services/activity.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, AfterViewInit {
  buildings: Building[] = [];
  filteredBuildings: Building[] = [];
  minPrice = new Map<number, number | null>();
  loading = true;
  searchTerm: string = '';

  @ViewChildren('scrollRow') scrollRows!: QueryList<ElementRef<HTMLDivElement>>;

  constructor(
    private buildingSvc: BuildingService,
    private activitySvc: ActivityService
  ) {}

  ngOnInit() { this.load(); }
  ngAfterViewInit() {}

  load() {
    this.loading = true;
    this.buildingSvc.getAllBuildings().subscribe({
      next: (b) => {
        this.buildings = b;
        this.filteredBuildings = b; // initially all
        this.computeAllMinPrices();
        this.loading = false;
      },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  private computeAllMinPrices() {
    for (const building of this.buildings) {
      for (const v of building.venues) {
        this.computeVenueMin(v);
      }
    }
  }

  private computeVenueMin(v: Venue) {
    if (!v.activityIds || v.activityIds.length === 0) {
      this.minPrice.set(v.venueId, null);
      return;
    }
    const obs = v.activityIds.map(id => this.activitySvc.getActivityById(id));
    forkJoin(obs).subscribe({
      next: (acts) => {
        const prices = acts.filter(a => !!a).map(a => (a as Activity).price);
        if (!prices.length) { this.minPrice.set(v.venueId, null); return; }
        const min = Math.min(...prices);
        this.minPrice.set(v.venueId, Math.round(min));
      },
      error: (err) => { 
        console.warn('price fetch error', v.venueId, err); 
        this.minPrice.set(v.venueId, null); 
      }
    });
  }

  getMinPrice(venueId: number) { return this.minPrice.get(venueId) ?? null; }

  scroll(elem: HTMLDivElement, dir: 'left' | 'right') {
    const amount = elem.clientWidth - 96;
    elem.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  /** Filter buildings & venues dynamically */
  filterBuildings() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredBuildings = this.buildings;
      return;
    }
    this.filteredBuildings = this.buildings
      .map(b => ({
        ...b,
        venues: b.venues.filter(v => 
          v.venueName.toLowerCase().includes(term) ||
          (v.venueType?.toLowerCase().includes(term)) ||
          (v.capacity?.toString().includes(term)) ||
          b.buildingName.toLowerCase().includes(term) ||
          (b.address?.toLowerCase().includes(term))
        )
      }))
      .filter(b => b.venues.length > 0 || b.buildingName.toLowerCase().includes(term) || (b.address?.toLowerCase().includes(term)));
  }
}
