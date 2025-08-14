import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Building } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
    private apiUrl = 'http://localhost:8080/api/buildings';
    constructor(private http: HttpClient) {}

  getBuilding(buildingId: number): Observable<Building> {
    return this.http.get<Building>(`${this.apiUrl}/view/by-buildingId/${buildingId}`);
  }

  getAllBuildings(): Observable<Building[]> { 
    return this.http.get<Building[]>(`${this.apiUrl}/view/all`); 
  }

  addBuilding(buildingData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/add`, buildingData, { headers });
  }
  deleteBuilding(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
