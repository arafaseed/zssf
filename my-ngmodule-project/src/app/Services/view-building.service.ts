import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface Building {
  buildingId: number;
  buildingName: string;
  address: string;
} 

@Injectable({
  providedIn: 'root'
})
export class ViewBuildingService {
  private apiUrl = 'http://localhost:8080/api/buildings/view/all';

  constructor(private http: HttpClient) {}

  // ✅ return the observable
  getAllBuildings(): Observable<Building[]> {
    return this.http.get<Building[]>(this.apiUrl);
  }
}