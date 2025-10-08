import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Venue } from '../models/models';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class VenueService {

  private base = `${environment.apiUrl}/api/venues`;
  private staffBase = `${environment.apiUrl}/api/staff`;

  constructor(private http: HttpClient) {}
  getVenue(venueId: number): Observable<Venue> {
    return this.http.get<Venue>(`${this.base}/view/${venueId}`);
  }
  
   // ✅ Get all staff assigned to a specific venue
  getVenueStaff(venueId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.staffBase}/all/by-assigned-venue/${venueId}`
);
  } 
}
