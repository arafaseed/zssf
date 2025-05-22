import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {

  private apiUrl = 'http://localhost:8080/api/buildings/add';
  private apUrl = 'http://localhost:8080/api/buildings';


  constructor(private http: HttpClient) {}

  addBuilding(buildingData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, buildingData, { headers });
  }
  deleteBuilding(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apUrl}/delete/${id}`);
  }
}
