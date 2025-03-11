import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeasePackageService } from '../../packages.service';
import { __values } from 'tslib';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-lease-package-form',
  standalone: false,
  templateUrl: './lease-package-form.component.html',
  styleUrls: ['./lease-package-form.component.css']
})
export class LeasePackageFormComponent implements OnInit {
  leaseForm: FormGroup;
  venues: any[] = []; // Store venue list

  constructor(
    private fb: FormBuilder,
    private leasePackageService: LeasePackageService,
    private snackBar: MatSnackBar // Inject Snackbar
  ) {
    this.leaseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.min(0)]],
      venueId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Fetch venues from the service
    this.leasePackageService.getVenues().subscribe({
      next: (data) => {
        this.venues = data;
      },
      error: (error) => {
        this.showToast('Error loading venues: ' + error.message, 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.leaseForm.valid) {
      const leasePackage = {
        ...this.leaseForm.value,
        venueId: this.leaseForm.value.venueId ? parseInt(this.leaseForm.value.venueId, 10) : null
      };

      this.leasePackageService.addLeasePackage(leasePackage, leasePackage.venueId).subscribe({
        next: (response) => {
          this.showToast('Lease package added successfully!', 'success');
          this.leaseForm.reset();
        },
        error: (error) => {
          this.showToast('Error adding lease package: ' + error.message, 'error');
        }
      });
    }
  }

  // Snackbar Toast Alert
  private showToast(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}