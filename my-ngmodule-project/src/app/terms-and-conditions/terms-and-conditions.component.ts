import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: false,
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.css'] // This can be empty if all styles are Tailwind
})
export class TermsAndConditionsComponent implements OnInit {

  lastUpdated: string = '';

  constructor() { }

  ngOnInit(): void {
    this.lastUpdated = 'August 11, 2025';
  }

}