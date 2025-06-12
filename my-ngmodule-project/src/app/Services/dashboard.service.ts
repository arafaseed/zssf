import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  searchBookings(phone: string, date: string): Observable<any[]> {
  const params: any = {};
  if (phone) params.phone = phone;
  if (date) params.date = date;
  return this.http.get<any[]>(`${this.apiUrl}/search`, { params });
}

}
