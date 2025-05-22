import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../Services/token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenStorageService,
    private jwtHelper: JwtHelperService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();

    if (token) {
      // If token is expired
      if (this.jwtHelper.isTokenExpired(token)) {
        console.warn('JWT token is expired. Redirecting to login.');
        this.tokenService.signOut();
        this.router.navigate(['/login']);
        return next.handle(req);  // Allow request without token
      }

      // Token exists and is valid
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }

    // No token case: still allow request
    console.info('No auth token found. Sending request without Authorization header.');
    return next.handle(req);
  }
}

