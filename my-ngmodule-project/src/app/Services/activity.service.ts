import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private activityApi = 'http://localhost:8080/api/activities';
  private venueApi = 'http://localhost:8080/api/venues';

  constructor(private http: HttpClient) {}

  // Add activity to a venue
  addActivity(activity: any, venueId: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.activityApi}/add/to-venue/${venueId}`, activity, { headers });
  }

  // Get all venues (for dropdown)
  getVenues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.venueApi}/view/all`);
  }
}
