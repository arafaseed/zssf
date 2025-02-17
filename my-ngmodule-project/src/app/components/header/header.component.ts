import { Component } from '@angular/core';
<<<<<<< HEAD
import { Router } from '@angular/router'; // Import Router from @angular/router
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
=======
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [
     MatToolbarModule,
     MatButtonModule,
   ],
  styleUrls: ['./header.component.css'],
  exportAs: 'appHeader',
})
export class HeaderComponent {
<<<<<<< HEAD
  // Inject Router in the constructor
  constructor(private router: Router) {}

  handleClickVenue() {
    this.router.navigate(['/Venueslist']).then(() => {
      window.location.reload();
    });
=======
  constructor(private router: Router) {} // Inject the Router service
  navigateToVenue() {
    this.router.navigate(['/venue']);
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc
  }
}
