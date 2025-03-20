import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeasePackageService } from '../../packages.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-lease-package-edit-form',
  standalone: false,
  templateUrl: './lease-package-edit-form.component.html',
  styleUrls: ['./lease-package-edit-form.component.css']
})
export class LeasePackageEditFormComponent implements OnInit {
  leaseForm!: FormGroup;
  venues: any[] = [];
  selectedVenueName: string = '';
  isLeaseDataLoaded: boolean = false;

  constructor(
    private fb: FormBuilder,
    private leasePackageService: LeasePackageService,
    private dialogRef: MatDialogRef<LeasePackageEditFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { leaseId: number }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadVenues();

    if (this.data.leaseId) {
      this.loadLeasePackageDetails(this.data.leaseId);
    }
  }

  initializeForm(): void {
    this.leaseForm = this.fb.group({
      packageName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.min(0)]],
      venueId: ['', Validators.required]
    });
  }

  loadVenues(): void {
    this.leasePackageService.getVenues().subscribe(
      (data: any[]) => {
        this.venues = data;
        
        if (!this.isLeaseDataLoaded && this.venues.length > 0) {
          this.leaseForm.patchValue({ venueId: this.venues[0].venueId });
          this.selectedVenueName = this.venues[0].venueName;
        }
      },
      (error: any) => {
        console.error('Error fetching venues:', error);
        alert('Failed to load venues.');
      }
    );
  }

  loadLeasePackageDetails(leaseId: number): void {
    this.leasePackageService.getLeasePackageById(leaseId).subscribe(
      (leasePackage: any) => {
        console.log('Loading lease package details:', leasePackage);
        
        this.leaseForm.patchValue({
          packageName: leasePackage.packageName, // Updated to include package name
          description: leasePackage.description,
          price: leasePackage.price,
          venueId: leasePackage.venueId
        });

        this.isLeaseDataLoaded = true;

        const selectedVenue = this.venues.find(venue => venue.venueId === leasePackage.venueId);
        if (selectedVenue) {
          this.selectedVenueName = selectedVenue.venueName;
        }

        console.log('Form value after patch:', this.leaseForm.value);
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching lease package details:', error);
        alert('Failed to load lease package details.');
      }
    );
  }

  onSubmit(): void {
    if (this.leaseForm.valid) {
      const leasePackage = {
        ...this.leaseForm.value,
        venueId: parseInt(this.leaseForm.value.venueId, 10)
      };

      this.leasePackageService.updateLeasePackage(this.data.leaseId, leasePackage).subscribe(
        (response: any) => {
          console.log('Lease package updated successfully:', response);
          alert('Lease package updated successfully!');
          this.dialogRef.close(true);
        },
        (error: HttpErrorResponse) => {
          console.error('Error updating lease package:', error);
          alert('Failed to update lease package: ' + error.message);
        }
      );
    } else {
      alert('Please fill out the form correctly.');
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onVenueChange(): void {
    const selectedVenueId = this.leaseForm.get('venueId')?.value;
    const selectedVenue = this.venues.find(venue => venue.venueId === selectedVenueId);
    this.selectedVenueName = selectedVenue ? selectedVenue.venueName : '';
  }
}
