import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewVenueService {
  [x: string]: any;

  private apiUrl = 'http://localhost:8080/api/venues/all';
  
  constructor(private http: HttpClient) {}

  getAllVenues(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  
}
