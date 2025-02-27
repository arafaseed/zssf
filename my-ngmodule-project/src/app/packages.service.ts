import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeasePackageService {
  private apiUrl = 'http://localhost:8080/api/lease-packages';

  constructor(private http: HttpClient) { }

  getAllLeasePackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  addLeasePackage(leasePackage: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, leasePackage);
  }

  updateLeasePackage(id: number, leasePackage: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, leasePackage);
  }

  getLeasePackageById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  deleteLeasePackage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
