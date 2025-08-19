import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Staff {
  id?: number;
  staffIdentification: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  assignedVenueIds?: number[];
}

export interface Venue {
  venueId: number;
  venueName: string;
}

@Injectable({
  providedIn: 'root'
})
export class StaffViewService {
  private apiUrl = 'http://localhost:8080/api/staff';
  private venueApiUrl = 'http://localhost:8080/api/venues'; // endpoint for venues

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Staff APIs
  getAllStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }

  getStaffById(id: number): Observable<Staff> {
    return this.http.get<Staff>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createStaff(staffData: Staff): Observable<Staff> {
    return this.http.post<Staff>(`${this.apiUrl}`, staffData, { headers: this.getAuthHeaders() });
  }

  updateStaff(id: number, staffData: Staff): Observable<Staff> {
    return this.http.put<Staff>(`${this.apiUrl}/${id}`, staffData, { headers: this.getAuthHeaders() });
  }

  deleteStaff(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Venue API
  getAllVenues(): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${this.venueApiUrl}`, { headers: this.getAuthHeaders() });
  }
}
