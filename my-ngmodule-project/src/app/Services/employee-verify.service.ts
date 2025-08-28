import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface VerifyResponse {
  verified: boolean;
  discountGranted: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeVerifyService {
  private apiUrl = `${environment.apiUrl}/api/auth/staff/employee/verify`;

  constructor(private http: HttpClient) {}

  verifyEmployee(username: string, password: string): Observable<VerifyResponse> {
    const body = { username, password };
    return this.http.post<VerifyResponse>(this.apiUrl, body);
  }
}
