import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeasePackageService } from '../../packages.service';

@Component({
  selector: 'app-lease-package-form',
  templateUrl: './lease-package-form.component.html',
  standalone: false,
  styleUrls: ['./lease-package-form.component.css']
})
export class LeasePackageFormComponent implements OnInit {
  leaseForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private leasePackageService: LeasePackageService
  ) {
    // Initialize the form in the constructor
    this.leaseForm = this.fb.group({
      description: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Additional initialization if needed
  }

  onSubmit(): void {
    if (this.leaseForm.valid) {
      this.leasePackageService.addLeasePackage(this.leaseForm.value).subscribe({
        next: (response) => {
          console.log('Lease package added successfully', response);
          this.leaseForm.reset();
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    }
  }
}
