// src/app/Services/activity.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';


export interface Activity {
  activityId?: number;
  activityName: string;
  description: string;
  price: number;
  venueId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private base = `${environment.apiUrl}/api/activities`;
  private venueBase = `${environment.apiUrl}/api/venues`;
  private cache = new Map<number, Observable<Activity | null>>();

  constructor(private http: HttpClient) {}

  /** Add activity for a given venue:
   * POST ${environment.apiUrl}/api/activities/add/{venueId}
   * body: { activityName, description, price }
   */
  addActivity(activity: Partial<Activity>, venueId: number): Observable<any> {
    return this.http.post(`${this.base}/add/${venueId}`, activity)
      .pipe(catchError(err => { console.error('addActivity error', err); return throwError(() => err); }));
  }

  /** GET ${environment.apiUrl}/api/activities/all */
  getAllActivities(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/all`).pipe(
      catchError(err => { console.error('getAllActivities error', err); return of([]); })
    );
  }

  /** GET a single activity:
   * GET ${environment.apiUrl}/api/activities/activityBy/{activityId}
   */
  getActivityById(id: number): Observable<Activity | null> {
    if (this.cache.has(id)) return this.cache.get(id)!;
    const obs = this.http.get<Activity>(`${this.base}/activityBy/${id}`).pipe(
      catchError(err => { console.warn('getActivityById failed', id, err); return of(null); }),
      shareReplay(1)
    );
    this.cache.set(id, obs);
    return obs;
  }

  /** PUT ${environment.apiUrl}/api/activities/update/{activityId} with body { activityName, description, price } */
  updateActivity(id: number, payload: Partial<Activity>): Observable<any> {
    return this.http.put(`${this.base}/update/${id}`, payload)
      .pipe(catchError(err => { console.error('updateActivity error', err); return throwError(() => err); }));
  }

  /** DELETE ${environment.apiUrl}/api/activities/delete/{activityId} */
  deleteActivity(id: number): Observable<any> {
    return this.http.delete(`${this.base}/delete/${id}`, { responseType: 'text' }).pipe(
      catchError(err => { console.error('deleteActivity error', err); return throwError(() => err); })
    );
  }

  /** GET venues list for dropdowns:
   * GET ${environment.apiUrl}/api/venues/view/all
   */
  getVenues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.venueBase}/view/all`).pipe(
      catchError(err => { console.error('getVenues error', err); return of([]); })
    );
  }
}
