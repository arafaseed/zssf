import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private apiUrl = 'http://localhost:8080/api/venues/add';
  constructor(private http: HttpClient) {}
  registerVenue(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
  getBuildings(): Observable<any> {
    return this.http.get('http://localhost:8080/api/buildings/all');
  }
  getLeasePackages(): Observable<any> {
    return this.http.get('http://localhost:8080/api/lease-packages/all');
  }
  deleteVenue(venueId: number) {
    return this.http.delete(`api/venues/${venueId}`);
  }
}
