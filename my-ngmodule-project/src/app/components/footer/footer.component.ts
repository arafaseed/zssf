import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-footer',
  standalone: false,
  // imports: [CommonModule, MatIconModule, MatListModule, MatToolbarModule],

  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {


  // Dynamic copyright text
  copyrightText: string;

  constructor() {
    this.copyrightText = `© 2025 Zanzibar Social Security Fund (ZSSF). All rights reserved.`;
  }
}
