import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  standalone:false,
})
export class TermsAndConditionsComponent {
  accepted = false;

  constructor(private router: Router) {}

  onAgree() {
    // Redirect after acceptance
    this.router.navigate(['/venue']);
  }
}
