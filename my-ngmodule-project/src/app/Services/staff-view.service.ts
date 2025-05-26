import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private apiUrl = 'http://localhost:8080/api/staff'; // base URL of your backend

  constructor(private http: HttpClient) {}

  // Fetch all staff
  getAllStaff(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  // Add a new staff member
  addStaff(staffData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, staffData);
  }

  // Optionally: Delete a staff member by IDN
  deleteStaff(staffIDN: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${staffIDN}`);
  }

  // Optionally: Update a staff member
  updateStaff(staffIDN: string, updatedData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${staffIDN}`, updatedData);
  }
}
