import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class BuildinglistService {

  private apiUrl = 'http://localhost:8080/api/buildings/all'; // Backend URL for fetching all buildings

  constructor(private http: HttpClient) {}

  // Fetch all buildings
  getBuildings(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteBuilding(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8080/api/buildings/delete/${id}`);
  }
  
}
