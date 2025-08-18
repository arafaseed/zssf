import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OptionalService } from '../models/models';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OptionalServiceService {

  private base = 'http://localhost:8080/api/optional-services';
  private venueUrl = 'http://localhost:8080/api/venues';
  private cache = new Map<number, Observable<OptionalService | null>>();

  constructor(private http: HttpClient) {}

  // --- Caching method ---
  getServiceById(id: number): Observable<OptionalService | null> {
    if (this.cache.has(id)) return this.cache.get(id)!;
    const obs = this.http.get<OptionalService>(`${this.base}/serviceBy/${id}`)
      .pipe(catchError(() => of(null)), shareReplay(1));
    this.cache.set(id, obs);
    return obs;
  }

  // --- API methods for component ---
 getOptionalServiceById(id: number): Observable<OptionalService | null> {
  return this.http.get<OptionalService>(`${this.base}/serviceBy/${id}`)
    .pipe(
      catchError(() => of(null))
    );
}

  getVenues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.venueUrl}/view/all`);
  }
   

  updateOptionalService(serviceId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/update/${serviceId}`, data);
  }


 addOptionalServiceToVenue(venueId: number, data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.base}/add/${venueId}`, data, { headers });
}



  getAllOptionalServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/all`);
  }

  deleteOptionalService(serviceId: number): Observable<any> {
  return this.http.delete(`${this.base}/delete/${serviceId}`, { responseType: 'text' });
}

  
  findByVenueId(venueId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/venue/${venueId}`);
  }

  searchByDescription(description: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/search?description=${description}`);
  }

  findByPriceRange(minPrice: number, maxPrice: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}`);
  }
}
