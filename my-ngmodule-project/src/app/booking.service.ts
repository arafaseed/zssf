import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {


  constructor(private http: HttpClient) {}

  createBooking(bookingData: any): Observable<any> {
    // const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post('http://localhost:8080/api/bookings/create', bookingData);
  }

  


  getVenues(): Observable<any> {
    return this.http.get('http://localhost:8080/api/venues/all');
  }
}

