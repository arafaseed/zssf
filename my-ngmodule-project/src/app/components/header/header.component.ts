import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router from @angular/router
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

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
  // Inject Router in the constructor
  constructor(private router: Router) {}

  handleClickVenue() {
    this.router.navigate(['/Venueslist']).then(() => {
      window.location.reload();
    });
  }
}
