import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { StaffLoginRequest } from '../../models/auth';
import { AuthService } from '../../Services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form!: FormGroup;
  hidePassword = true;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.form = this.fb.group({
      staffIdentification: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  submit(): void {
    if (this.form.invalid) { return; }
    this.loading = true;
    this.errorMsg = '';

    this.auth.login(this.form.value as StaffLoginRequest).subscribe({
      next: () => {
        this.loading = false;
        const role = this.auth.role;
        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/staff/dashboard']);
        }
      },
      error: () => {
        this.loading = false;
        this.translate.get('login.errors.invalidCredentials').subscribe(msg => {
          this.errorMsg = msg;
        });
      }
    });
  }
}
