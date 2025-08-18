import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';
import { OptionalService } from '../../models/models';
import { OptionalServiceService } from '../../Services/optional.service';

@Component({
  selector: 'app-optional-service-edit-form',
  templateUrl: './optional-service-edit-form.component.html',
  standalone:false,
  styleUrls: ['./optional-service-edit-form.component.css']
})
export class OptionalServiceEditFormComponent implements OnInit {
  serviceForm!: FormGroup;
  venues: any[] = [];

  constructor(
    private fb: FormBuilder,
    private optionalServiceService: OptionalServiceService,
    private dialogRef: MatDialogRef<OptionalServiceEditFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { serviceId: number }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadVenues();
    if (this.data.serviceId) this.loadServiceDetails(this.data.serviceId);
  }

  initializeForm(): void {
    this.serviceForm = this.fb.group({
      serviceName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      price: ['', [Validators.required, Validators.min(0)]],
      venueId: ['', Validators.required]
    });
  }

  loadVenues(): void {
    this.optionalServiceService.getVenues().subscribe(
      data => this.venues = data,
      error => console.error('Error loading venues:', error)
    );
  }

loadServiceDetails(serviceId: number): void { 
  this.optionalServiceService.getOptionalServiceById(serviceId).subscribe(
    (service: any) => {   // <-- use any
      if (service) {
        this.serviceForm.patchValue({
          serviceName: service.serviceName,
          description: service.description,
          price: service.price,
          venueId: service.venue?.venueId   // optional chaining
        });
      }
    },
    (error: HttpErrorResponse) => console.error('Error loading service:', error)
  );
}



  onSubmit(): void {
    if (this.serviceForm.valid) {
      const updatedService = {
        ...this.serviceForm.value,
        venueId: parseInt(this.serviceForm.value.venueId, 10)
      };
      this.optionalServiceService.updateOptionalService(this.data.serviceId, updatedService).subscribe(
        response => {
          alert('Optional service updated successfully!');
          this.dialogRef.close(true);
        },
        (error: HttpErrorResponse) => {
          console.error('Error updating service:', error);
          alert('Failed to update service: ' + error.message);
        }
      );
    } else {
      alert('Please fill out the form correctly.');
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
