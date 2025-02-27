import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeasePackageService } from '../../packages.service';

@Component({
  selector: 'app-lease-package-form',
  standalone: false,
  templateUrl: './lease-package-form.component.html',
  styleUrls: ['./lease-package-form.component.css']
})
export class LeasePackageFormComponent implements OnInit {
  leaseForm: FormGroup;
  leaseId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private leasePackageService: LeasePackageService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.leaseForm = this.fb.group({
      description: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.leaseId = +id;
        this.loadLeasePackage(this.leaseId);
      }
    });
  }

  loadLeasePackage(id: number): void {
    this.leasePackageService.getLeasePackageById(id).subscribe(data => {
      if (data) {
        this.leaseForm.patchValue({
          description: data.description,
          price: data.price
        });
      }
    }, error => {
      console.error('Error fetching lease package:', error);
    });
  }

  onSubmit(): void {
    if (this.leaseForm.valid) {
      const leaseData = this.leaseForm.value;

      if (this.leaseId) {
        this.leasePackageService.updateLeasePackage(this.leaseId, leaseData).subscribe(() => {
          alert('Lease Package Updated Successfully');
          this.router.navigate(['/admin/lease-packages']);
        }, error => {
          console.error('Error updating lease package:', error);
        });
      } else {
        this.leasePackageService.addLeasePackage(leaseData).subscribe(() => {
          alert('Lease Package Added Successfully');
          this.router.navigate(['/admin/lease-packages']);
        }, error => {
          console.error('Error adding lease package:', error);
        });
      }
    }
  }
}
