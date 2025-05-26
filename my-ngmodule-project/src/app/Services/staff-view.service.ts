import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StaffViewService {
  private apiUrl = 'http://localhost:8080/api/staff';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Or however you store your auth token
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getAllStaff(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders()
    });
  }

  addStaff(staffData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, staffData, {
      headers: this.getAuthHeaders()
    });
  }

  updateStaff(staffId: number, updatedData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${staffId}`, updatedData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteStaff(staffId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${staffId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
