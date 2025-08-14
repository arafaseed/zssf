import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  standalone: false,
})
export class FeedbackComponent {
  feedback = {
    name: '',
    email: '',
    comment: ''
  };

  constructor(private router: Router) {}

  submitFeedback() {
    console.log('Feedback submitted:', this.feedback);
    alert('Thank you for your feedback!');
    this.feedback = { name: '', email: '', comment: '' };
  }

  onCancel() {
 {
      this.router.navigate(['/']); // navigate to homepage
    }
  
}}
