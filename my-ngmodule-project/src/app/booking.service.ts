import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private apiUrl = 'http://localhost:8080/api/bookings'; // Adjust as needed

  constructor(private httpClient: HttpClient) { }

  // createBooking(bookingData: any): Observable<any> {
  //   return this.httpClient.post(`${this.apiUrl}/create`, bookingData, {
  //     headers: new HttpHeaders({'Content-Type': 'application/json'})
  //   });
  // }
  createBooking(formattedBookingData:any) :Observable<any>{
    return this.httpClient.post(`${this.apiUrl}/create`, formattedBookingData,{
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    });
  }
}
