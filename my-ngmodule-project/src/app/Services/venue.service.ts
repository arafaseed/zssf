import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Venue } from '../models/models';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class VenueService {

  private base = `${environment.apiUrl}/api/venues`;

  constructor(private http: HttpClient) {}
  getVenue(venueId: number): Observable<Venue> {
    return this.http.get<Venue>(`${this.base}/view/${venueId}`);
  }
}
