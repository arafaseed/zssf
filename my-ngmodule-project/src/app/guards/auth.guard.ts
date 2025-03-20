import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    // Get the role from localStorage
    const role = localStorage.getItem('role');
    
    // Get the expected role from route data using bracket notation
    const expectedRole = route.data['role'];

    // If the role matches the expected role, allow access
    if (role === expectedRole) {
      return true;
    } else {
      // Redirect to the login page or any other page if the role doesn't match
      this.router.navigate(['/']);
      return false;
    }
  }
}
