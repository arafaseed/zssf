import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewVenueService {
  [x: string]: any;

  private venueApiUrl ='http://localhost:8080/api/venues';

  
  constructor(private http: HttpClient) {}

  getAllVenues(): Observable<any> {
    return this.http.get (`${this.venueApiUrl}/view/all`);

  }

  deleteVenue(id: number): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/venues/delete/${id}`, { responseType: 'text' });
  }
  
  
}
