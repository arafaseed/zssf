import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeasePackageService } from '../../packages.service';

@Component({
  selector: 'app-lease-package-form',
  templateUrl: './lease-package-form.component.html',
  styleUrls: ['./lease-package-form.component.css']
})
export class LeasePackageFormComponent {
  leaseForm: FormGroup;

  constructor(private fb: FormBuilder, private leaseService: LeasePackageService) {
    this.leaseForm = this.fb.group({
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.leaseForm.valid) {
      this.leaseService.addLeasePackage(this.leaseForm.value).subscribe(
        (        response: any) => {
          console.log('Lease Package Added:', response);
          alert('Lease package added successfully!');
          this.leaseForm.reset();  // Reset form after successful submission
        },
        (        error: any) => {
          console.error('Error adding lease package:', error);
          alert('Failed to add lease package');
        }
      );
    }
  }
}
