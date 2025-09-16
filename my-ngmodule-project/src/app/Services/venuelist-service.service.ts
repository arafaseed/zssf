import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class VenuelistServiceService implements OnInit {
  venues: any[] = [];
  private apiUrl = `${environment.apiUrl}/api/venues/all`;  // Adjust the URL to match your backend

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadVenues();
  }

  // Fetch all venues
  getVenues(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Load venues when the component is initialized
  loadVenues() {
    this.getVenues().subscribe(
      (data) => {
        // console.log('Venues loaded:', data);  // Check if all venues are returned
        this.venues = data;
      },
      (error) => {
        console.error('Error loading venues:', error);
      }
    );
  }

  // Delete a venue by ID
  deleteVenue(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/venues/delete/${id}`);
  }
}
