import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: false,
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.css']
})
export class TermsAndConditionsComponent implements OnInit {

  lastUpdated: string = '';

  constructor() { }

  ngOnInit(): void {
    // Format today's date
    const today = new Date();
    this.lastUpdated = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
