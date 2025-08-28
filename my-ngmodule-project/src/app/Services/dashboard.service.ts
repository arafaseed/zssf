import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface VenueRevenue {
  venueId: number;
  venueName: string;
  revenue: number;
}

export interface RawVenueRevenue {
  venue: {
    venueId: number;
    venueName: string;
    bookingIds: number[];
    // …etc
  };
  revenue: number;
}

export interface BestRevenueVenue {
  venue: {
    venueId:      number;
    venueName:    string;
    capacity:     number;
    description:  string;
    venueImages:  string[];
    buildingId:   number;
    leasePackageIds:    number[];
    assignedStaffIds:   number[];
    bookingIds:         number[];
    activitiesAllowedIds:number[];
  };
  revenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings/view-all`);
  }

  searchBookings(phone: string, date: string): Observable<any[]> {
  const params: any = {};
  if (phone) params.phone = phone;
  if (date) params.date = date;
  return this.http.get<any[]>(`${this.apiUrl}/bookings/search`, { params });
}

// dashboard.service.ts
getAllVenues(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/venues/view/all`);
}

  
  
   getTotalRevenue(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/payments/revenue/total`);
  }

  getMonthlyRevenue(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/payments/revenue/monthly`);
  }

  getMostBookedVenue(): Observable<{ venueName: string }> {
    return this.http.get<{ venueName: string }>(`${this.apiUrl}/bookings/most-booked`);
  }

  getMostBookedCompletedVenue(): Observable<{ venueName: string }> {
    return this.http.get<{ venueName: string }>(`${this.apiUrl}/bookings/most-booked/completed`);
  }

  getAvailableVenues(date: string): Observable<{ count: number, venues: any[] }> {
  return this.http.get<{ count: number, venues: any[] }>(
    `${this.apiUrl}/bookings/list-available-venues`, { params: { date } }
  );
}
  getBestRevenueVenue(): Observable<BestRevenueVenue> {
    return this.http.get<BestRevenueVenue>(
      `${this.apiUrl}/analytics/venues/revenue/best`);
  }

   getTopVenuesByRevenue(): Observable<RawVenueRevenue[]> {
    return this.http.get<RawVenueRevenue[]>(
      `${this.apiUrl}/analytics/venues/revenue/all`
    );
  }


}
