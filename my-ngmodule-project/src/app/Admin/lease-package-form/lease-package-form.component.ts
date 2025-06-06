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
    private snackBar: MatSnackBar, // Inject Snackbar
    private router: Router // 2. Inject Router
  ) {
    this.leaseForm = this.fb.group({
      packageName: ['', [Validators.required, Validators.minLength(3)]], // Added packageName field
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
           console.log('Navigating to leasepackagetable...')
          // 3. Navigate to the package table page after success
          this.router.navigate(['/admin/leasepackagetable']);
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
