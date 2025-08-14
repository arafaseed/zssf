import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-employee-verify',
  standalone: false,
  template: `
    <h2 mat-dialog-title>Employee verification (demo)</h2>
    <mat-dialog-content>
      <p>Enter domain and password to verify as employee (demo only).</p>
      <mat-form-field class="w-full"><mat-label>Domain</mat-label><input matInput [(ngModel)]="domain"></mat-form-field>
      <mat-form-field class="w-full"><mat-label>Password</mat-label><input matInput type="password" [(ngModel)]="password"></mat-form-field>
      <div *ngIf="error" class="text-red-600">{{ error }}</div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="verify()">Verify</button>
    </mat-dialog-actions>
  `
})
export class EmployeeVerifyComponent {
  domain = '';
  password = '';
  error = '';

  constructor(private ref: MatDialogRef<EmployeeVerifyComponent>) {}

  verify() {
    // Demo verification: accept domain 'zssf' and password 'password'
    if (this.domain === 'zssf' && this.password === 'password') {
      this.ref.close({ verified: true });
    } else {
      this.error = 'Invalid credentials (demo). Use domain "zssf" and password "password".';
    }
  }

  close() { this.ref.close({ verified: false }); }
}
