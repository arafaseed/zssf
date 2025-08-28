import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BuildinglistService {

  private apiUrl = `${environment.apiUrl}/api/buildings`; 

  constructor(private http: HttpClient) {}

  // Fetch all buildings
  getBuildings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/view/all`);
  }

  // Fetch a single building by ID
  // Fetch a single building by ID
getBuildingById(buildingId: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/view/by-buildingId/${buildingId}`);
}

  // Add a new building
  addBuilding(buildingData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/add`, buildingData, { headers });
  }

  // Update building by ID
  updateBuilding(buildingId: number, buildingData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(`${this.apiUrl}/update/${buildingId}`, buildingData, { headers });
  }

  // Delete a building by ID
deleteBuilding(buildingId: number): Observable<void> {
  console.log('Deleting building with ID:', buildingId);
  return this.http.delete<void>(`${environment.apiUrl}/api/buildings/delete-building/${buildingId}`);
}

}
