import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [
     MatToolbarModule,
     MatButtonModule,
     MatIconModule,
     MatButtonModule,
     CommonModule
   ],
  styleUrls: ['./header.component.css'],
  exportAs: 'appHeader',
})
export class HeaderComponent {
  
  constructor(private router: Router) {} // Inject the Router service
   isHomePage: boolean = false; // ✅ Declare the property
   ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentUrl = this.router.url;
        // ✅ ONLY hide on homepage
        this.isHomePage = currentUrl === '/venue' || currentUrl === '/venue';
      });
  }
 
 
  goHome(): void {
    this.router.navigate(['/venue']);
   }
   gomybooking(): void {
    this.router.navigate(['/mybooking']);
   }
   
   
  }

