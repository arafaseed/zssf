import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';



export interface Building {
  buildingId: number;
  buildingName: string;
  address: string;
} 

@Injectable({
  providedIn: 'root'
})
export class ViewBuildingService {
  private apiUrl = `${environment.apiUrl}/api/buildings/view/all`;

  constructor(private http: HttpClient) {}

  // ✅ return the observable
  getAllBuildings(): Observable<Building[]> {
    return this.http.get<Building[]>(this.apiUrl);
  }
}