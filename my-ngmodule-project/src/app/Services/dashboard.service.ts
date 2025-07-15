import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface VenueRevenue {
  venueId: number;
  venueName: string;
  revenue: number;
}

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

// dashboard.service.ts
getAllVenues(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:8080/api/venues/view/all');
}
  
  
   getTotalRevenue(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/payments/revenue/total`);
  }

  getMonthlyRevenue(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/payments/revenue/monthly`);
  }

  getMostBookedVenue(): Observable<{ venueName: string }> {
    return this.http.get<{ venueName: string }>(`${this.apiUrl}/bookings/most-booked`);
  }

  getMostBookedCompletedVenue(): Observable<{ venueName: string }> {
    return this.http.get<{ venueName: string }>(`${this.apiUrl}/bookings/most-booked/completed`);
  }

  getAvailableVenues(date: string): Observable<Array<{ venueId: number; venueName: string }>> {
    return this.http.get<Array<{ venueId: number; venueName: string }>>(
      `${this.apiUrl}/bookings/list-available-venues`, { params: { date } }
    );
  }

  getBestRevenueVenue(): Observable<VenueRevenue> {
    return this.http.get<VenueRevenue>(`${this.apiUrl}/analytics/venues/revenue/best`);
  }

  getTopVenuesByRevenue(): Observable<VenueRevenue[]> {
    return this.http.get<VenueRevenue[]>(`${this.apiUrl}/analytics/venues/revenue/all`);
  }


}
