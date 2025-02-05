import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { FooterComponent } from '../footer/footer.component';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-home',
  standalone: false,
  // imports: [
  //   RouterModule,
  //   CommonModule,
  //   MatCardModule,
  //   MatIconModule,
  //   MatButtonModule,
  //   MatToolbarModule,
  
   
  // ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

 
  currentYear = new Date().getFullYear();

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: any) {
    // Detect when navigation ends and reload if returning to home
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/home') {
        if (isPlatformBrowser(this.platformId)) {
          // window.location.reload();  // Reload only when on the browser
        }
      }
    });
  
  }

  handleClick() {
    this.router.navigate(['/venues']).then(() => {
      window.location.reload();
    });
  }
  
  navigateToContact() {
    this.router.navigate(['/contact']).then(() => {
      window.location.reload(); // Forces a page reload after navigation
    });
  }
 
}
