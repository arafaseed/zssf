import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Venue } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VenueService {

  private base = 'http://localhost:8080/api/venues';

  constructor(private http: HttpClient) {}
  getVenue(venueId: number): Observable<Venue> {
    return this.http.get<Venue>(`${this.base}/view/${venueId}`);
  }
}
