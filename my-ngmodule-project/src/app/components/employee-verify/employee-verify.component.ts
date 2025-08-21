import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { EmployeeVerifyService, VerifyResponse } from '../../Services/employee-verify.service';

@Component({
  selector: 'app-employee-verify',
  standalone: false,
  templateUrl: './employee-verify.component.html',
  styleUrls: ['./employee-verify.component.css']
})
export class EmployeeVerifyComponent {
  username = '';
  password = '';
  error = '';
  message = '';
  hidePassword = true;
  isLoading = false;

  constructor(
    private ref: MatDialogRef<EmployeeVerifyComponent>,
    private verifyService: EmployeeVerifyService
  ) {}

  verify() {
    this.error = '';
    this.message = '';
    this.isLoading = true;

    this.verifyService.verifyEmployee(this.username, this.password).subscribe({
      next: (resp: VerifyResponse) => {
        this.isLoading = false;
        this.message = resp.message;

        if (resp.verified && resp.discountGranted > 0) {
          // Employee verified and discount granted
          this.ref.close({
            verified: true,
            discountRate: resp.discountGranted
          });
        } else if (resp.verified) {
          // Verified but no discount available
          this.ref.close({
            verified: true,
            discountRate: 0
          });
        } else {
          // Not verified
          this.error = resp.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = 'Server error. Please try again later.';
        console.error('Verification failed', err);
      }
    });
  }

  close() {
    this.ref.close({ verified: false });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
}
