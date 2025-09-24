import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FeedbackService } from '../../Services/feedback.service';
import { FeedbackDto, FeedbackType } from '../../models/models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-feedback',
  standalone: false,
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  sending = false;
  successMessage = '';

  // Phone must be exactly 10 digits and start with 06,07 or 08
  private PHONE_PATTERN = /^(06|07|08)\d{8}$/;

  form: FormGroup;

  // verification state: null = not checked yet, true = exists, false = not exists
  phoneVerified: boolean | null = null;
  verifyingPhone = false;
  lastCheckedPhone = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
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

    // disable comment until phone is verified
    this.comment.disable();
  }

  ngOnInit(): void {
    // Read possible autofill values from query params (set by invoice page)
    const qp = this.route.snapshot.queryParamMap;
    const name = (qp.get('name') || '').trim();
    const email = (qp.get('email') || '').trim();
    const phone = (qp.get('phone') || '').trim();

    // Only patch values we actually have (keeps default type)
    const patch: Partial<{ name: string; email: string; phone: string; type: string }> = {};
    if (name) patch.name = name;
    if (email) patch.email = email;
    if (phone) patch.phone = phone;

    // Patch form with the values (will not touch other controls)
    this.form.patchValue(patch);

    // if we got a phone from query params, attempt verification immediately
    if (phone) {
      // store lastCheckedPhone so we don't re-check same number repeatedly
      this.verifyPhone(phone, /*silent*/ true);
    }
  }

  // Strongly typed accessors
  get name(): AbstractControl { return this.form.get('name')!; }
  get email(): AbstractControl { return this.form.get('email')!; }
  get phone(): AbstractControl { return this.form.get('phone')!; }
  get type(): AbstractControl { return this.form.get('type')!; }
  get comment(): AbstractControl { return this.form.get('comment')!; }

  /**
   * Called on phone input blur (wired in template). Triggers verification.
   * silent=true will not show the positive message repeatedly (only errors).
   */
  onPhoneBlur(): void {
    const phoneValue = String(this.phone.value || '').trim();
    if (!phoneValue) {
      this.phoneVerified = null;
      this.comment.disable();
      return;
    }
    if (!this.PHONE_PATTERN.test(phoneValue)) {
      // invalid formatting — mark error, don't call API
      this.phone.setErrors({ pattern: true });
      this.phoneVerified = null;
      this.comment.disable();
      return;
    }
    // only re-check if phone changed or last check was inconclusive
    if (phoneValue !== this.lastCheckedPhone) {
      this.verifyPhone(phoneValue, false);
    }
  }

  /**
   * Verify phone via API. If verified -> enable comment control.
   * If not verified -> disable comment and show translated popup informing user.
   * @param phone phone number to verify
   * @param silent whether to avoid showing the positive "you can proceed" message
   */
  private verifyPhone(phone: string, silent = false): void {
    if (!phone || !this.PHONE_PATTERN.test(phone)) {
      this.phoneVerified = null;
      this.comment.disable();
      return;
    }

    // prevent concurrent checks
    this.verifyingPhone = true;
    this.svc.checkCustomerExists(phone)
      .pipe(finalize(() => (this.verifyingPhone = false)))
      .subscribe(exists => {
        this.lastCheckedPhone = phone;
        this.phoneVerified = !!exists;

        if (exists) {
          // allow user to fill comment
          this.comment.enable();

          if (!silent) {
            this.translate.get('feedback.phoneVerified').subscribe(msg => {
              this.snackBar.open(msg, 'OK', { duration: 4000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['success-snackbar'] });
            });
          }
        } else {
          // disable comment and prevent submit
          this.comment.disable();
          this.comment.setErrors({ disabledUntilPhoneRegistered: true });

          // show a translated popup informing user they must book first
          this.translate.get('feedback.phoneNotRegistered').subscribe(msg => {
            // use snackbar as popup; you can swap for MatDialog if you prefer a modal dialog
            this.snackBar.open(msg, 'OK', {
              duration: 8000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['error-snackbar']
            });
          });
        }
      }, () => {
        // on HTTP error treat as not found (safer)
        this.phoneVerified = false;
        this.comment.disable();
        this.translate.get('feedback.phoneCheckFailed').subscribe(msg => {
          this.snackBar.open(msg, 'OK', {
            duration: 6000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['error-snackbar']
          });
        });
      });
  }

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

    // If phone hasn't been checked yet, check now and only submit when verified.
    if (this.phoneVerified === null) {
      // verify then submit if exists
      this.verifyingPhone = true;
      this.svc.checkCustomerExists(phoneValue)
        .pipe(finalize(() => (this.verifyingPhone = false)))
        .subscribe(exists => {
          this.phoneVerified = !!exists;
          if (exists) {
            // enable comment (for UX consistency) and send
            this.comment.enable();
            this.performSubmitPayload(phoneValue, commentValue);
          } else {
            // inform user they must book first
            this.comment.disable();
            this.translate.get('feedback.phoneNotRegistered').subscribe(msg => {
              this.snackBar.open(msg, 'OK', {
                duration: 8000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
                panelClass: ['error-snackbar']
              });
            });
          }
        }, () => {
          this.translate.get('feedback.phoneCheckFailed').subscribe(msg => {
            this.snackBar.open(msg, 'OK', {
              duration: 6000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['error-snackbar']
            });
          });
        });

      return; // verification flow will continue in subscribe
    }

    if (this.phoneVerified === false) {
      // already checked and user is not a customer
      this.translate.get('feedback.phoneNotRegistered').subscribe(msg => {
        this.snackBar.open(msg, 'OK', {
          duration: 8000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['error-snackbar']
        });
      });
      return;
    }

    // if phoneVerified === true -> proceed immediately
    this.performSubmitPayload(phoneValue, commentValue);
  }

  private performSubmitPayload(phoneValue: string, commentValue: string): void {
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
        // after reset we should leave comment disabled until phone re-verified
        this.phoneVerified = null;
        this.comment.disable();
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
    // after cancel keep comment disabled until next verification
    this.phoneVerified = null;
    this.comment.disable();
    this.router.navigate(['/']);
  }
}
