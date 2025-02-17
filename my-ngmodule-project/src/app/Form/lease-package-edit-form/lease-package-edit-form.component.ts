import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeasePackageService } from '../../packages.service'; // Ensure correct import

@Component({
  selector: 'app-lease-package-edit-form',
  templateUrl: './lease-package-edit-form.component.html',
  standalone: false,
  styleUrls: ['./lease-package-edit-form.component.css'],
})
export class LeasePackageEditFormComponent implements OnInit {
  leaseForm: FormGroup;
  leasePackageId!: number;

  constructor(
    private fb: FormBuilder,
    private leasePackageService: LeasePackageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Define the form structure with initial empty values
    this.leaseForm = this.fb.group({
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    // Get the lease package ID from the route parameters
    this.leasePackageId = +this.route.snapshot.paramMap.get('id')!;

    // Fetch the lease package data from the server
    this.loadLeasePackage();
  }

  loadLeasePackage(): void {
    this.leasePackageService.getLeasePackageById(this.leasePackageId).subscribe(
      (data: { category: any; price: any; }) => {
        // Populate the form with the fetched data
        this.leaseForm.patchValue({
          category: data.category,
          price: data.price,
        });
      },
      (error: any) => {
        console.error('Error loading lease package:', error);
        alert('Error loading lease package data.');
      }
    );
  }

  onSubmit(): void {
    if (this.leaseForm.valid) {
      const leaseData = this.leaseForm.value;

      // Call the service to update the lease package
      this.leasePackageService.updateLeasePackage(this.leasePackageId, leaseData).subscribe(
        (response) => {
          console.log('Lease package updated:', response);
          alert('Lease package updated successfully!');
          this.router.navigate(['/lease-packages']); // Redirect to the lease packages list
        },
        (error) => {
          console.error('Error updating lease package:', error);
          alert('Error updating lease package.');
        }
      );
    }
  }
}
