import { Component, OnInit } from '@angular/core';
import { ViewVenueService } from '../../view-venue.service';

@Component({
  selector: 'app-view-venues',
  standalone: false,
  
  templateUrl: './view-venues.component.html',
  styleUrl: './view-venues.component.css'
})
export class ViewVenuesComponent implements OnInit {
    venues: any[] = [];
displayedColumns: any;
  
    constructor(private venueService: ViewVenueService) {}
  
    ngOnInit(): void {
      this.loadVenues();
    }
  
    loadVenues(): void {
      // Get all venues data
      this.venueService.getAllVenues().subscribe(
        (data: any[]) => {
          this.venues = data;
        },
        (error: any) => {
          console.error('Error fetching venues:', error);
        }
      );
    }
  }
