import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeasePackageService {
  private apiUrl = 'http://localhost:8080/api/lease-packages';
  private venueApiUrl = 'http://localhost:8080/api/venues'; // Added venue API

  constructor(private http: HttpClient) { }

  // Lease Package Operations
  getAllLeasePackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  addLeasePackage(leasePackage: any, venueId: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/add/${venueId}`, leasePackage, { headers });
}

  updateLeasePackage(id: number, leasePackage: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, leasePackage);
  }

  getLeasePackageById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/${id}`);
  }

  deleteLeasePackage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // Venue Operations (Added)
  getVenues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.venueApiUrl}/view/all`);
  }
}
