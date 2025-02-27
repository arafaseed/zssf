import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeasePackageService {

  private apiUrl = 'http://localhost:8080/api/lease-packages';

  constructor(private http: HttpClient) { }

  // Get all lease packages
  getAllLeasePackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  // Add a new lease package
  addLeasePackage(leasePackage: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, leasePackage);
  }

  // Update an existing lease package
  updateLeasePackage(id: number, leasePackage: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, leasePackage);
  }

  // Get lease package by ID (Fixing incorrect API path)
  getLeasePackageById(id: number): Observable<any> {
    console.log(`Fetching lease package with ID: ${id}`);
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap((data: any) => {
        console.log('Fetched data:', data);
      })
    );
  }

  // Delete a lease package by ID
  deleteLeasePackage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
