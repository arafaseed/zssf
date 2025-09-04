import { Component, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { OptionalServiceService } from '../../Services/optional.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-optional-service-add-form',
  templateUrl: './optional-service-add-form.component.html',
  standalone: false,
  styleUrls: ['./optional-service-add-form.component.css']
})
export class OptionalServiceAddFormComponent implements OnInit {
  serviceForm!: FormGroup;
  venues: any[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private optionalServiceService: OptionalServiceService,
    private router: Router,
    @Optional() private dialogRef?: MatDialogRef<OptionalServiceAddFormComponent> // optional injection
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadVenues();
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
      (data: any[]) => {
        this.venues = data;
      },
      (error: any) => {
        console.error('Error fetching venues:', error);
        alert('Failed to load venues.');
      }
    );
  }

  onSubmit(): void {
    if (this.serviceForm.valid) {
       this.isSubmitting = true; // Show spinner
      const newService = {
        ...this.serviceForm.value,
        venueId: parseInt(this.serviceForm.value.venueId, 10)
      };

      this.optionalServiceService.addOptionalServiceToVenue(newService.venueId, newService).subscribe(
        () => {
          alert('Optional service added successfully!');
          // Close dialog if opened in dialog mode
          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            this.router.navigate(['/admin/tableoptional']); // navigate if standalone page
          }
        },
        (error: HttpErrorResponse) => {
          console.error('Error adding optional service:', error);
          alert('Failed to add service: ' + error.message);
        }
      );
    } else {
      alert('Please fill out the form correctly.');
    }
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['/admin/tableoptional']);
    }
  }
}
