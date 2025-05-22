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

  updateLeasePackage(leaseId: number, leasePackage: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${leaseId}`, leasePackage);
  }

  getLeasePackageById(leaseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/leaseBy/${leaseId}`);
  }

  deleteLeasePackage(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, { responseType: 'text' });
  }
  

  // Venue Operations (Added)
  getVenues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.venueApiUrl}/view/all`);
  }
}

