import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [
     MatToolbarModule,
     MatButtonModule,
     MatIconModule
   ],
  styleUrls: ['./header.component.css'],
  exportAs: 'appHeader',
})
export class HeaderComponent {
  constructor(private router: Router) {} // Inject the Router service
  navigateToVenue() {
    this.router.navigate(['/venue']);
  }
}
