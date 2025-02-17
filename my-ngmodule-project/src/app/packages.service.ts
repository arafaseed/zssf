import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient, HttpHeaders } from '@angular/common/http';
=======
import { HttpClient } from '@angular/common/http';
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeasePackageService {
<<<<<<< HEAD
 
private apiUrl = 'http://localhost:8080/api/lease-packages/add';

  constructor(private http: HttpClient) {}
  addLeasePackage(leasePackage: any): Observable<any> {
    console.log('Sending lease package:', leasePackage); // Debugging log
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, leasePackage, { headers });
  }
}  
=======

  private apiUrl = 'http://localhost:8080/api/lease-packages';

  constructor(private http: HttpClient) { }

  getAllLeasePackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  addLeasePackage(leasePackage: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, leasePackage);
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
}




















// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class LeasePackageService {
 
// private apiUrl = 'http://localhost:8080/api/lease-packages/add';

//   constructor(private http: HttpClient) {}
//   addLeasePackage(leasePackage: any): Observable<any> {
//     console.log('Sending lease package:', leasePackage); // Debugging log
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.apiUrl, leasePackage, { headers });
//   }
// }  
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc
