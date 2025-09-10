import { Component } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FeedbackService } from '../../Services/feedback.service';
import { FeedbackDto, FeedbackType } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

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

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private svc: FeedbackService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      phone: ['', [Validators.required, Validators.pattern(this.PHONE_PATTERN)]],
      type: ['FEEDBACK', Validators.required],
      comment: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Strongly typed accessors
  get name(): AbstractControl { return this.form.get('name')!; }
  get email(): AbstractControl { return this.form.get('email')!; }
  get phone(): AbstractControl { return this.form.get('phone')!; }
  get type(): AbstractControl { return this.form.get('type')!; }
  get comment(): AbstractControl { return this.form.get('comment')!; }

  submitFeedback(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const phoneValue = String(this.phone.value).trim();
    const commentValue = String(this.comment.value).trim();

    if (!this.PHONE_PATTERN.test(phoneValue)) {
      this.phone.setErrors({ pattern: true });
      return;
    }
    if (!commentValue) {
      this.comment.setErrors({ required: true });
      return;
    }

    const selectedType = (this.type.value as unknown as FeedbackType) ?? 'FEEDBACK';

    const payload: Partial<FeedbackDto> = {
      name: this.name.value ? String(this.name.value).trim() : undefined,
      email: this.email.value ? String(this.email.value).trim() : null,
      phone: phoneValue,
      type: selectedType,
      comment: commentValue
    };

    this.sending = true;

    this.svc.createFeedback(payload).subscribe({
      next: () => {
        this.sending = false;

        this.translate.get('feedback.success').subscribe(msg => {
          this.successMessage = msg;
          this.snackBar.open(msg, 'Close', {
            duration: 8000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['success-snackbar']
          });
        });

        this.form.reset({ type: 'FEEDBACK' });
        setTimeout(() => (this.successMessage = ''), 8000);
      },
      error: () => {
        this.sending = false;
        this.translate.get('feedback.error').subscribe(msg => {
          this.successMessage = msg;
          this.snackBar.open(msg, 'Close', {
            duration: 6000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['error-snackbar']
          });
        });
        setTimeout(() => (this.successMessage = ''), 8000);
      }
    });
  }

  onCancel(): void {
    this.form.reset({ type: 'FEEDBACK' });
    this.router.navigate(['/']);
  }
}
