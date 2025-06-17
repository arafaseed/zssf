import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  styleUrls: ['./header.component.css'],
  exportAs: 'appHeader',
  standalone: true // Add if using standalone components
})
export class HeaderComponent {
  isHomePage: boolean = false;
  isBookingPage: boolean = false;

  constructor(public router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentUrl = event.urlAfterRedirects;
      this.isHomePage = currentUrl.startsWith('/venue');
      this.isBookingPage = currentUrl.startsWith('/mybooking');
    });
  }

  goHome(): void {
    this.router.navigate(['/venue']);
  }

  gomybooking(): void {
    this.router.navigate(['/mybooking']);
  }
}

