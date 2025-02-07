import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeasePackageService {
 
private apiUrl = 'http://localhost:8080/api/lease-packages/add';

  constructor(private http: HttpClient) {}
  addLeasePackage(leasePackage: any): Observable<any> {
    console.log('Sending lease package:', leasePackage); // Debugging log
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, leasePackage, { headers });
  }
}  