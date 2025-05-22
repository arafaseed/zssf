import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { JwtResponse, StaffLoginRequest } from '../models/auth';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'http://localhost:8080/api/auth/staff'; // same host → proxy.conf.json can rewrite

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {}

  login(credentials: StaffLoginRequest): Observable<boolean> {
    return this.http
      .post<JwtResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(res => {
          // Persist returned data in the browser session
          this.tokenStorage.saveToken(res.token);
          this.tokenStorage.saveUsername(res.staffIDN);
          this.tokenStorage.saveRole(res.role);
          return true;          // Signal success to component
        })
      );
  }

  // Add these public methods to access token storage functionality
  getUsername(): string | null {
    return this.tokenStorage.getUsername();
  }

  getStaffIDN(): string | null {
    // Assuming you have this method in TokenStorageService
    return this.tokenStorage.getUsername();
  }

  logout(): void {
    this.tokenStorage.signOut();
  }

  get role(): string | null {
    return this.tokenStorage.getRole();
  }

  get isLoggedIn(): boolean {
    return !!this.tokenStorage.getToken();
  }
}
