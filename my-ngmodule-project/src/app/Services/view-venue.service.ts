import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ViewVenueService {
  private venueApiUrl = 'http://localhost:8080/api/venues';
  private buildingApiUrl = 'http://localhost:8080/api/buildings';
  private leasePackageApiUrl = 'http://localhost:8080/api/lease-packages';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllVenues(): Observable<any> {
    return this.http.get(`${this.venueApiUrl}/view/all`, { headers: this.getAuthHeaders() });
  }

  getVenueById(id: number): Observable<any> {
    return this.http.get(`${this.venueApiUrl}/view/${id}`, { headers: this.getAuthHeaders() });
  }

  deleteVenue(id: number): Observable<any> {
    return this.http.delete(`${this.venueApiUrl}/delete/${id}`, { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  searchVenuesByName(name: string): Observable<any> {
    return this.http.get(`${this.venueApiUrl}/search?name=${name}`, { headers: this.getAuthHeaders() });
  }

  getLeasePackagesByVenue(venueId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.leasePackageApiUrl}/venue/${venueId}`, { headers: this.getAuthHeaders() });
  }

  getBuildingById(id: number): Observable<any> {
    return this.http.get(`${this.buildingApiUrl}/view/${id}`, { headers: this.getAuthHeaders() });
  }

  // New methods to add:
  updateVenue(id: number, data: any): Observable<any> {
    return this.http.put(`${this.venueApiUrl}/update/${id}`, data, { headers: this.getAuthHeaders() });
  }

  registerVenue(data: any): Observable<any> {
    return this.http.post(`${this.venueApiUrl}/create`, data, { headers: this.getAuthHeaders() });
  }
}
