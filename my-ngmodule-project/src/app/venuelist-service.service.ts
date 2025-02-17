import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VenuelistServiceService implements OnInit {
  venues: any[] = [];
  private apiUrl = 'http://localhost:8080/api/venues/all';  // Adjust the URL to match your backend

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
        console.log('Venues loaded:', data);  // Check if all venues are returned
        this.venues = data;
      },
      (error) => {
        console.error('Error loading venues:', error);
      }
    );
  }

  // Delete a venue by ID
  deleteVenue(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/venues/delete/${id}`);
  }
}
