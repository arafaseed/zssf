import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewVenueService {
  [x: string]: any;

  private venueApiUrl ='http://localhost:8080/api/venues';

  
  constructor(private http: HttpClient) {}

  getAllVenues(): Observable<any> {
    return this.http.get (`${this.venueApiUrl}/view/all`);

  }
  getVenueById(id: number): Observable<any> {
    return this.http.get(`${this.venueApiUrl}/view/${id}`);
  }

  deleteVenue(id: number): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/venues/delete/${id}`, { responseType: 'text' });
  }
<<<<<<< HEAD

  searchVenuesByName(name: string): Observable<any> {
    return this.http.get(`${this.venueApiUrl}/search?name=${name}`);
  }
  
=======
    //  Search Venues by Name
    searchVenues(name: string): Observable<any> {
      return this.http.get(`${this.venueApiUrl}/search`, { params: { name } });
    }
>>>>>>> aba054b86ca11cdc62ee6aea0210a48076b1fe74
  
}
