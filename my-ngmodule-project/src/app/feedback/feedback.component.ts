// feedback.component.ts
import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FeedbackService } from '../Services/feedback.service';
import { FeedbackDto, FeedbackType } from '../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-feedback',
  standalone: false,
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent {
  sending = false;
  successMessage = '';

  // Phone must be exactly 10 digits and start with 06,07 or 08
  private PHONE_PATTERN = /^(06|07|08)\d{8}$/;

  // declare form; initialize in constructor once fb is available
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private svc: FeedbackService,
    private snackBar: MatSnackBar
  ) {
    // initialize the form here — fb is ready
    this.form = this.fb.group({
      name: ['',Validators.required],
      email: ['', Validators.email],
      phone: ['', [Validators.required, Validators.pattern(this.PHONE_PATTERN)]],
      type: ['FEEDBACK', Validators.required],
      comment: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // --- Strongly typed accessors to avoid "possibly null" errors ---
  get name(): AbstractControl { return this.form.get('name')!; }
  get email(): AbstractControl { return this.form.get('email')!; }
  get phone(): AbstractControl { return this.form.get('phone')!; }
  get type(): AbstractControl { return this.form.get('type')!; }
  get comment(): AbstractControl { return this.form.get('comment')!; }

  submitFeedback(): void {
    // mark fields to show validation if invalid
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // At this point validators guarantee presence / shape:
    const phoneValue = String(this.phone.value).trim();
    const commentValue = String(this.comment.value).trim();

    // Defensive check (very unlikely after validation)
    if (!this.PHONE_PATTERN.test(phoneValue)) {
      this.phone.setErrors({ pattern: true });
      return;
    }
    if (!commentValue) {
      this.comment.setErrors({ required: true });
      return;
    }

    // Ensure `type` is a valid FeedbackType (fallback to FEEDBACK)
    const selectedType = (this.type.value as unknown as FeedbackType) ?? 'FEEDBACK';

    const payload: Partial<FeedbackDto> = {
      name: this.name.value ? String(this.name.value).trim() : undefined,
      email: this.email.value ? String(this.email.value).trim() : null, // optional
      phone: phoneValue,               // required validated
      type: selectedType,              // properly typed
      comment: commentValue            // required validated
    };

    this.sending = true;
    this.svc.createFeedback(payload).subscribe({
      next: () => {
        this.sending = false;
        this.successMessage = 'Thank you — your message has been received. We review all submissions promptly.';

      this.snackBar.open(this.successMessage, 'Close', {
      duration: 8000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['success-snackbar'] // optional class for styling
      });

        // reset but keep default type
        this.form.reset({ type: 'FEEDBACK' });
        setTimeout(() => (this.successMessage = ''), 8000);
      },
      error: (err) => {
        console.error('Feedback submit error', err);
        this.sending = false;
        const errMsg = 'An error occurred while sending your feedback. Please try again later.';
        this.successMessage = errMsg;

      this.snackBar.open(errMsg, 'Close', {
      duration: 6000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: ['error-snackbar']
      });

        setTimeout(() => (this.successMessage = ''), 8000);
      }
    });
  }

  onCancel(): void {
    // clear form and navigate home
    this.form.reset({ type: 'FEEDBACK' });
    this.router.navigate(['/']);
  }
}
