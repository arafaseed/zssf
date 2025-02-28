import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeasePackageService } from '../../packages.service';
import { __values } from 'tslib';


@Component({
  selector: 'app-lease-package-form',
  standalone: false,
  templateUrl: './lease-package-form.component.html',
  styleUrls: ['./lease-package-form.component.css']
})
export class LeasePackageFormComponent implements OnInit {
  leaseForm: FormGroup;
  errorMessage: string | null = null;
  venues: any[] = []; // Store venue list

  constructor(
    private fb: FormBuilder,
    private leasePackageService: LeasePackageService,
  
  ) {
    this.leaseForm = this.fb.group({
      description: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      venueId: ['', [Validators.required]]  // Added venue selection
    });
  }

  ngOnInit(): void {
    // Fetch venues from the service
    this.leasePackageService.getVenues().subscribe({
      next: (data) => {
        this.venues = data;
      },
      error: (error) => {
        this.errorMessage = 'Error loading venues: ' + error.message;
      }
    });
  }

  onSubmit(): void {
    if (this.leaseForm.valid) {
        console.log('Submitting:', this.leaseForm.value); // Debugging log

        const leasePackage = {
            ...this.leaseForm.value,
            venueId: this.leaseForm.value.venueId ? parseInt(this.leaseForm.value.venueId, 10) : null
        };

        console.log('Submitting:', leasePackage);

        // Pass the venueId to the service method
        this.leasePackageService.addLeasePackage(leasePackage, leasePackage.venueId).subscribe({
            next: (response) => {
                console.log('Lease package added successfully', response);
                this.leaseForm.reset();
            },
            error: (error) => {
                console.error('Error adding lease package:', error);
                this.errorMessage = error.message;
            }
        });
    }
}
}
