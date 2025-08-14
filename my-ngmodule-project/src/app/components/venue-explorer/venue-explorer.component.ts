import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VenueService } from '../../Services/venue.service';
import { BuildingService } from '../../Services/building.service';
import { ActivityService } from '../../Services/activity.service';
import { OptionalServiceService } from '../../Services/optional.service';
import { forkJoin, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BookingModalComponent } from '../booking-modal/booking-modal.component';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-venue-explorer',
  standalone: false,
  templateUrl: './venue-explorer.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class VenueExplorerComponent implements OnInit {
  venue: any = null;
  building: any = null;
  activities: any[] = [];
  optionalServices: any[] = [];
  minActivityPrice: number | null = null;
  loading = true;
  currentImageIndex = 0;

  // availability form model
  startDate!: Date | null;
  startTime = '09:00';
  endDate!: Date | null;
  endTime = '17:00';
  selectedActivityId?: number;

  constructor(
    private route: ActivatedRoute,
    private venueSvc: VenueService,
    private buildingSvc: BuildingService,
    private activitySvc: ActivityService,
    private optionalSvc: OptionalServiceService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.loadAll(id);
  }

  loadAll(venueId: number) {
    this.loading = true;
    this.currentImageIndex = 0;
    this.venueSvc.getVenue(venueId).subscribe({
      next: (v) => {
        this.venue = v;
        // fetch building
        this.buildingSvc
          .getBuilding(v.buildingId)
          .subscribe((b) => (this.building = b));
        // fetch activities and optional services in parallel
        const actObs =
          v.activityIds && v.activityIds.length
            ? forkJoin(
                v.activityIds.map((aid: number) =>
                  this.activitySvc.getActivityById(aid)
                )
              )
            : of([]);
        const optObs =
          v.optionalServiceIds && v.optionalServiceIds.length
            ? forkJoin(
                v.optionalServiceIds.map((sid: number) =>
                  this.optionalSvc.getServiceById(sid)
                )
              )
            : of([]);

        forkJoin([actObs, optObs]).subscribe({
          next: ([actsRaw, optsRaw]: any) => {
            // filter nulls and normalize
            this.activities = (actsRaw || []).filter(Boolean);
            this.optionalServices = (optsRaw || []).filter(Boolean);
            // compute min activity price
            const prices = this.activities
              .map((a: any) => Number(a.price))
              .filter((p) => !isNaN(p));
            this.minActivityPrice = prices.length
              ? Math.round(Math.min(...prices))
              : null;
            // default select first activity if present
            if (this.activities.length) {
              const maxPriceActivity = this.activities.reduce((prev, curr) =>
                Number(curr.price) > Number(prev.price) ? curr : prev
              );
              this.selectedActivityId = maxPriceActivity.activityId;
            }

            this.loading = false;
          },
          error: (err) => {
            console.warn(err);
            this.loading = false;
          },
        });
      },
      error: (err) => {
        console.error('failed loading venue', err);
        this.loading = false;
      },
    });
  }

  // image gallery helper
  selectedImage(index: number) {
    return this.venue?.venueImages?.[index] ?? null;
  }

  onSelectImage(index: number) {
    this.currentImageIndex = index;
  }

  openAvailabilityModal() {
    if (!this.venue) return;
    const start = this.combineDateTime(this.startDate, this.startTime);
    const end = this.combineDateTime(this.endDate, this.endTime);
    const activity = this.activities.find(
      (a) => a.activityId === this.selectedActivityId
    );
    this.dialog.open(BookingModalComponent, {
  width: '900px',             // larger, avoids horizontal scroll
  maxHeight: '90vh',         // vertical scroll only if needed
  data: {
    venueId: this.venue.venueId,
    venueName: this.venue.venueName,
    start,
    end,
    startTime: this.startTime,
    endTime: this.endTime,
    activityId: activity?.activityId,
    activityName: activity?.activityName
  }
});
  }

  combineDateTime(date?: Date | null, time?: string) {
    if (!date) return null;
    const [hh, mm] = (time || '00:00').split(':').map(Number);
    const d = new Date(date);
    d.setHours(hh, mm, 0, 0);
    return d;
  }
}
