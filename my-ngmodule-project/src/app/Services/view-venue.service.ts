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
  
  
  getVenueById(id: number): Observable<any> {
    return this.http.get(`${this.venueApiUrl}/view/${id}`);
  }

  deleteVenue(id: number): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/venues/delete/${id}`, { responseType: 'text' });
  }

  searchVenuesByName(name: string): Observable<any> {
    return this.http.get(`${this.venueApiUrl}/search?name=${name}`);
  }
getLeasePackagesByVenue(venueId: number) {
  return this.http.get<any[]>(`http://localhost:8080/api/lease-packages/venue/${venueId}`);
}

getBuildingById(buildingId: number): Observable<any> {
  return this.http.get(`http://localhost:8080/api/buildings/view/${buildingId}`);
}

  
}
