import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../Services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _: RouterStateSnapshot): boolean {
    const expectedRoles: string[] = route.data['roles'];   // e.g. ['STAFF','ADMIN']
    const userRole = this.auth.role;

    if (this.auth.isLoggedIn && expectedRoles.includes(userRole!)) {
      return true;
    }

    // Not permitted – redirect to login or 403 page
    this.router.navigate(['/login']);
    return false;
  }
}
