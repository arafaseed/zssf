import { Component } from '@angular/core';
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
export class HeaderComponent {}
