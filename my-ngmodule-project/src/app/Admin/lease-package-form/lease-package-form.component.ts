import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeasePackageService } from '../../Services/packages.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.leaseForm = this.fb.group({
      packageName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.min(0)]],
      venueId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
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
          this.router.navigate(['/admin/leasepackagetable']);
        },
        error: (error) => {
          this.showToast('Error adding lease package: ' + error.message, 'error');
        }
      });
    }
  }

  onCancel(): void {
    // Navigate back to lease package table or wherever you want on cancel
    this.router.navigate(['/admin/leasepackagetable']);
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}
