import { Component } from '@angular/core';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  standalone:false,
})
export class FeedbackComponent {
  feedback = {
    name: '',
    email: '',
    comment: ''
  };

  submitFeedback() {
    console.log('Feedback submitted:', this.feedback);
    alert('Thank you for your feedback!');
    this.feedback = { name: '', email: '', comment: '' };
  }
}
