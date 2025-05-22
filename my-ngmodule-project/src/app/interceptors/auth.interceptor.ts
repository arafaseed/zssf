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

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      // Clone request with auth header
      const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next.handle(authReq); // Return the observable
    } else if (token) {
      // Token expired – force logout
      this.tokenService.signOut();
      this.router.navigate(['/login']);
      return next.handle(req); // Still need to return an observable
    } else {
      // No token case
      return next.handle(req); // Return the original request
    }
  }
}

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   return next(req);
// };
