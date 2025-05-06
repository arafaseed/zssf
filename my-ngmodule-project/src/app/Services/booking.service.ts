// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class BookingService {
//   getLeasesByVenue(venueId: number) {
//     throw new Error('Method not implemented.');
//   }
//   getVenues() {
//     throw new Error('Method not implemented.');
//   }
//   getPackages(venueId: any) {
//     throw new Error('Method not implemented.');
//   }
//   private apiUrl = 'http://localhost:8080/api/bookings';

//   constructor(private http: HttpClient) {}

//   // Existing method to get booked dates for a venue
//   getBookedDates(venueId: number): Observable<string[]> {
//     return this.http.get<string[]>(
//       `${this.apiUrl}/venue/${venueId}/booked-dates`
//     );
//   }

//   // Existing method to create a booking
//   createBooking(bookingData: any): Observable<any> {
//     return this.http.post(`${this.apiUrl}/create`, bookingData);
//   }

//   // New method to check the availability of a venue
//   checkVenueAvailability(venueId: number, startDate: string, startTime: string): Observable<boolean> {
//     // Format the date and time correctly for the request
//     return this.http.get<boolean>(`${this.apiUrl}/check-availability`, {
//       params: {
//         venueId: venueId.toString(),
//         startDate: startDate,
//         startTime: startTime
//       }
//     });
//   }
// }


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, filter } from 'rxjs/operators';

export interface Booking {
  bookingId: number;
  bookingCode: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: 'PENDING' | 'COMPLETE' | 'CANCELLED';
  venue: {
    venueId: number;
    venueName: string;
  };
  customer: {
    customerId: number;
    fullName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  bookings$ = this.bookingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Fetch and store bookings
  fetchBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/all`).pipe(
      tap((bookings) => this.bookingsSubject.next(bookings))
    );
  }

  // Get cached bookings or fetch if not available
  getBookings(): Observable<Booking[]> {
    if (this.bookingsSubject.getValue().length === 0) {
      return this.fetchBookings();
    }
    return this.bookings$;
  }

  // Refresh the bookings list manually
  refreshBookings(): void {
    this.fetchBookings().subscribe();
  }

  // Existing method to get booked dates for a venue
  // getBookedDates(venueId: number): Observable<string[]> {
  //   return this.http.get<string[]>(`${this.apiUrl}/venue/${venueId}/booked-dates`);
  // }
  getBookedDates(venueId: number) {
    return this.http.get<any[]>(`/api/bookings/venue/${venueId}/booked-slots`);
  }
  

  // Existing method to create a booking
  createBooking(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, bookingData);
  }

  // Existing method to check the availability of a venue
  checkVenueAvailability(venueId: number, startDate: string, startTime: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-availability`, {
      params: {
        venueId: venueId.toString(),
        startDate: startDate,
        startTime: startTime
      }
    });
  }

  // Placeholder methods for getLeasesByVenue, getVenues, and getPackages
  getLeasesByVenue(venueId: number) {
    throw new Error('Method not implemented.');
  }

  getVenues() {
    throw new Error('Method not implemented.');
  }

  getPackages(venueId: any) {
    throw new Error('Method not implemented.');
  }
}


