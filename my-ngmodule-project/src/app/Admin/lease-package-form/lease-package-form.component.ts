import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeasePackageService } from '../../packages.service'; // Ensure correct import

@Component({
  selector: 'app-lease-package-form',
  standalone: false,
  templateUrl: './lease-package-form.component.html',
  styleUrls: ['./lease-package-form.component.css'],
})
export class LeasePackageFormComponent {
  leaseForm: FormGroup;

  constructor(private fb: FormBuilder, private leasePackageService: LeasePackageService) {
    this.leaseForm = this.fb.group({
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit() {
    if (this.leaseForm.valid) {
      const leaseData = this.leaseForm.value;

      this.leasePackageService.addLeasePackage(leaseData).subscribe(
        (response) => {
          console.log('Lease package added:', response);
          alert('Lease package submitted successfully!');
          this.leaseForm.reset();
        },
        (error) => {
          console.error('Error submitting lease package:', error);
          alert('Error submitting lease package.');
        }
      );
    }
  }
}
