import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Staff {
  assignedVenues: any;
  staffId: any;
  venue: any;
  id?: number;
  staffIdentification: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  assignedVenueIds?: number[];
  venueName?: string;       
}

export interface Venue {
  venueId: number;
  venueName: string;
}

@Injectable({
  providedIn: 'root'
})
export class StaffViewService {
 
  private apiUrl = '/api/staff';
  private venueApiUrl = '/api/venues'; // endpoint for venues
  assignStaffToVenues: any;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  addStaff(staffData: Staff): Observable<Staff> {
  return this.http.post<Staff>(`${this.apiUrl}/add`, staffData, { headers: this.getAuthHeaders() });
}


  // Staff APIs
  getAllStaff(): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${this.apiUrl}/all`, { headers: this.getAuthHeaders() });
  }

  getStaffById(id: number): Observable<Staff> {
    return this.http.get<Staff>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }


 createStaff(staffData: Staff): Observable<Staff> {
  return this.http.post<Staff>(`${this.apiUrl}/add`, staffData, { headers: this.getAuthHeaders() });
}




  updateStaff(id: number, staffData: Staff): Observable<Staff> {
    return this.http.put<Staff>(`${this.apiUrl}/${id}`, staffData, { headers: this.getAuthHeaders() });
  }

  deleteStaff(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Venue API
  getAllVenues(): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${this.venueApiUrl}/view/all`, { headers: this.getAuthHeaders() });
  }
assignStaffToVenue(staffId: number, venueId: number): Observable<Staff> {
  return this.http.post<Staff>(
    `${this.apiUrl}/${staffId}/venues/${venueId}`,
    {},
    { headers: this.getAuthHeaders() }
  );
}



getAssignedVenues(staffId: number): Observable<Venue[]> {
  return this.http.get<Venue[]>(`${this.apiUrl}/${staffId}/venues`, { headers: this.getAuthHeaders() });
}


}
