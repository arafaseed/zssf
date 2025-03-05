import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeasePackageService } from '../../packages.service';

@Component({
  selector: 'app-lease-package-edit-form',
  standalone: false,
  templateUrl: './lease-package-edit-form.component.html',
  styleUrls: ['./lease-package-edit-form.component.css']
})
export class LeasePackageEditFormComponent implements OnInit {
  leaseForm: FormGroup;
  leaseId!: number;
  errorMessage: string | null = null;
  venues: any[] = []; // Store venue list

  constructor(
    private fb: FormBuilder,
    private leasePackageService: LeasePackageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.leaseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.min(0)]],
      venueId: ['', [Validators.required]]  // Venue selection
    });
  }

  ngOnInit(): void {
    this.leaseId = +this.route.snapshot.paramMap.get('leaseId')!;
    console.log(this.leaseId);
    this.loadLeasePackage();
    this.loadVenues();
  }

  loadLeasePackage(): void {
    // Fetch the lease package data by ID
    this.leasePackageService.getLeasePackageById(this.leaseId).subscribe({
      next: (data) => {
        // Populate form with the lease package data
        this.leaseForm.patchValue({
          description: data.description,
          price: data.price,
          venueId: data.venueId
        });
      },
      error: (error) => {
        console.error('Error loading lease package:', error);
        alert('Error loading lease package data.');
      }
    });
  }

  loadVenues(): void {
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
      const leasePackage = {
        ...this.leaseForm.value,
        venueId: this.leaseForm.value.venueId ? parseInt(this.leaseForm.value.venueId, 10) : null
      };

      // Update the lease package using the service
      this.leasePackageService.updateLeasePackage(this.leaseId, leasePackage).subscribe({
        next: (response) => {
          console.log('Lease package updated successfully', response);
          this.router.navigate(['/lease-packages']); // Redirect to lease packages list
        },
        error: (error) => {
          console.error('Error updating lease package:', error);
          this.errorMessage = error.message;
        }
      });
    }
  }
}
