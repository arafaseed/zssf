import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Activity } from '../models/models';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

@Injectable({
   providedIn: 'root'
   })

export class ActivityService {

  private activityApi = 'http://localhost:8080/api/activities'; 
  
  private venueApi = 'http://localhost:8080/api/venues';
  private cache = new Map<number, Observable<Activity | null>>();

  constructor(private http: HttpClient) {}

  getActivityById(id: number): Observable<Activity | null> {
    if (this.cache.has(id)) return this.cache.get(id)!;
    const obs = this.http.get<Activity>(`${this.activityApi}/activityBy/${id}`)
      .pipe(
        catchError((err) => {
          console.warn('Activity load failed', id, err);
          return of(null);
        }),
        shareReplay(1)
      );
    this.cache.set(id, obs);
    return obs;
  }

    // Add activity to a venue
  addActivity(activity: any, venueId: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.activityApi}/add/to-venue/${venueId}`, activity, { headers });
  }

  // Get all venues (for dropdown)
  getVenues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.venueApi}/view/all`);
  }
  
// getActivityById(id: number): Observable<any> {
//   return this.http.get<any>(`${this.activityApi}/${id}`);
// }
  
  getAllActivities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.activityApi}`);
  }

  createActivity(activity: any): Observable<any> {
    return this.http.post(`${this.activityApi}`, activity);
  }

  deleteActivity(id: number): Observable<any> {
    return this.http.delete(`${this.activityApi}/${id}`);
  }

  updateActivity(id: number, activity: any): Observable<any> {
    return this.http.put(`${this.activityApi}/${id}`, activity);
  }
}









