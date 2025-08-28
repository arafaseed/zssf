import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private apiUrl = `${environment.apiUrl}/api/venues`;
  private venueApiUrl = `${environment.apiUrl}/api/venues`; // Added venue API

  constructor(private http: HttpClient) {}

  

  registerVenue(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, formData);
  }

  getBuildings(): Observable<any> {
    return this.http.get('${environment.apiUrl}/api/buildings/view/all');
  }

  getLeasePackages(): Observable<any> {
    return this.http.get('${environment.apiUrl}/api/lease-packages/all');
  }

  deleteVenue(venueId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${venueId}`);
  }
  getVenues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.venueApiUrl}/view/all`);
  }

  // Update an existing venue
  updateVenue(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, formData);
  }


  // Get a specific venue by ID
  getVenueById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/view/${id}`);
  }
  


  // Delete a specific image from a venue
  deleteVenueImage(venueId: number, imagePath: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${venueId}/delete-image?imagePath=${imagePath}`);
  }

  // Update only the images of a venue
  updateVenueImages(venueId: number, images: File[]): Observable<any> {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });
    return this.http.put(`${this.apiUrl}/${venueId}/update-images`, formData);
  }

  // Get the list of image paths for a specific venue
  getVenueImages(venueId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${venueId}/images`);
  }

  // Search venues by name
  searchVenuesByName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?name=${name}`);
  }

  // Filter venues by capacity
  filterVenuesByCapacity(minCapacity: number, maxCapacity: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/filter/capacity?minCapacity=${minCapacity}&maxCapacity=${maxCapacity}`);
  }

  // Get venues by building ID
  getVenuesByBuilding(buildingId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/building/${buildingId}`);
  }

  // Get venues by lease package price range
  getVenuesByLeasePackagePriceRange(minPrice: number, maxPrice: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/filter/lease-price?minPrice=${minPrice}&maxPrice=${maxPrice}`);
  }

 
}
