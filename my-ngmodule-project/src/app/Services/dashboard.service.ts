import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
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
  };
  revenue: number;
}

export interface BestRevenueVenue {
  venue: {
    venueId: number;
    venueName: string;
    capacity: number;
    description: string;
    venueImages: string[];
    buildingId: number;
    leasePackageIds: number[];
    assignedStaffIds: number[];
    bookingIds: number[];
    activitiesAllowedIds: number[];
  };
  revenue: number;
}

interface BookingStat {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'CANCELLED' | 'EXPIRED' | string;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // ------------------- MAIN DASHBOARD DATA -------------------
  getDashboardData(): Observable<any> {
    return forkJoin({
      allBookings: this.getAllBookings(),
      totalRevenue: this.getTotalRevenue(),
      mostBookedVenue: this.getMostBookedVenue(),
      bestRevenueVenue: this.getBestRevenueVenue(),
      topVenuesByRevenue: this.getTopVenuesByRevenue(),
    }).pipe(
      map((results) => {
        const bookings = results.allBookings || [];
        const totalCustomers = new Set(bookings.map(b => b.customerId || b.customer?.id)).size;
        const completedBookings = bookings.filter(b => b.status === 'COMPLETE').length;

        return {
          totalBookings: bookings.length,
          totalCustomers,
          totalRevenue: results.totalRevenue || 0,
          completedBookings,
          mostBookedVenue: results.mostBookedVenue?.venueName || 'N/A',
          bestRevenueVenue: results.bestRevenueVenue?.venue?.venueName || 'N/A',
          topVenuesByRevenue: results.topVenuesByRevenue?.map(v => ({
            name: v.venue.venueName,
            revenue: v.revenue
          })) || [],
          dateGenerated: new Date().toLocaleString()
        };
      })
    );
  }

  // ------------------- EXISTING METHODS -------------------
  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings/view-all`);
  }

  searchBookings(phone: string, date: string): Observable<any[]> {
    const params: any = {};
    if (phone) params.phone = phone;
    if (date) params.date = date;
    return this.http.get<any[]>(`${this.apiUrl}/bookings/search`, { params });
  }

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
      `${this.apiUrl}/analytics/venues/revenue/best`
    );
  }

  getTopVenuesByRevenue(): Observable<RawVenueRevenue[]> {
    return this.http.get<RawVenueRevenue[]>(
      `${this.apiUrl}/analytics/venues/revenue/all`
    );
  }

  getYearlyBookingStats(year: number): Observable<BookingStat[]> {
    const url = `${this.apiUrl}/analytics/booking-stats/yearly?year=${encodeURIComponent(String(year))}`;
    return this.http.get<BookingStat[]>(url);
  }

  getMonthlyBookingStats(year: number, month: number): Observable<BookingStat[]> {
    const url = `${this.apiUrl}/analytics/booking-stats/monthly?year=${encodeURIComponent(String(year))}&month=${encodeURIComponent(String(month))}`;
    return this.http.get<BookingStat[]>(url);
  }
}
