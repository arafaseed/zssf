import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router'; // To navigate after successful login
import { StaffLoginRequest } from '../../models/auth';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Use definite assignment assertion (!) to tell TypeScript this will be initialized
  form!: FormGroup;
  hidePassword = true;
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // Initialize the form in the constructor
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

        // Redirect based on role stored in sessionStorage
        const role = this.auth.role;
        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/staff/dashboard']);
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Invalid credentials';
      }
    });
  }
}