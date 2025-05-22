import { Injectable } from '@angular/core';

const TOKEN_KEY      = 'auth-token';
const USERNAME_KEY   = 'auth-username';
const ROLE_KEY       = 'auth-role';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  signOut(): void {
    sessionStorage.clear();
  }

  public saveToken(token: string): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  public saveUsername(username: string): void {
    sessionStorage.removeItem(USERNAME_KEY);
    sessionStorage.setItem(USERNAME_KEY, username);
  }

  public getUsername(): string | null {
    return sessionStorage.getItem(USERNAME_KEY);
  }

  public saveRole(role: string): void {
    sessionStorage.removeItem(ROLE_KEY);
    sessionStorage.setItem(ROLE_KEY, role);
  }

  public getRole(): string | null {
    return sessionStorage.getItem(ROLE_KEY);
  }
}
