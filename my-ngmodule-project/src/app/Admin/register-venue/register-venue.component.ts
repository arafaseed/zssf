import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenueService } from '../../Services/venue-service.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-venue',
  templateUrl: './register-venue.component.html',
  standalone: false,
  styleUrls: ['./register-venue.component.css']
})
export class RegisterVenueComponent implements OnInit {
  venueForm!: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  buildings: any[] = [];
  isEditing = false;
  VenueId: number | null = null;
  venues: any[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private venueService: VenueService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadBuildings();
    this.loadVenues();
  }

  initializeForm(): void {
    this.venueForm = this.fb.group({
      venueName: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      description: [''],
      buildingId: ['', Validators.required],
    });
  }

  loadBuildings(): void {
    this.venueService.getBuildings().subscribe(
      (data: any[]) => (this.buildings = data),
      (error: any) => {
        console.error('Error fetching buildings:', error);
        alert('Failed to load buildings.');
      }
    );
  }

  loadVenues(): void {
    this.venueService.getVenues().subscribe(
      (data: any[]) => (this.venues = data),
      (error: any) => {
        console.error('Error fetching venues:', error);
        alert('Failed to load venues.');
      }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const newFiles = Array.from(input.files);

      // Append new files to existing ones
      this.selectedFiles = [...this.selectedFiles, ...newFiles];

      // Generate previews for new images
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });

      // Reset the input so the same file can be re-selected
      input.value = '';
    }
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  editVenue(venueId: number): void {
    this.venueService.getVenueById(venueId).subscribe(
      (venue: any) => {
        this.venueForm.patchValue({
          venueName: venue.venueName,
          capacity: venue.capacity,
          description: venue.description,
          buildingId: venue.buildingId,
        });
        this.isEditing = true;
        this.VenueId = venueId;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching venue details:', error);
        alert('Failed to load venue details.');
      }
    );
  }

  onSubmit(): void {
    if (this.venueForm.valid) {
      this.isSubmitting = true;
      const formData = new FormData();
      const formValue = this.venueForm.value;

      const venueData = {
        venueName: formValue.venueName,
        capacity: formValue.capacity,
        description: formValue.description,
      };

      formData.append('venue', JSON.stringify(venueData));
      formData.append('buildingId', formValue.buildingId.toString());

      if (this.selectedFiles.length > 0) {
        this.selectedFiles.forEach(file => {
          formData.append('images', file);
        });
      }

      if (this.isEditing && this.VenueId !== null) {
        this.venueService.updateVenue(this.VenueId, formData).subscribe({
          next: () => {
            alert('Venue updated successfully!');
            this.resetForm();
            this.loadVenues();
            this.router.navigate(['/venueView']);
          },
          error: (error: HttpErrorResponse) => {
            alert('Failed to update venue: ' + error.message);
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });
      } else {
        this.venueService.registerVenue(formData).subscribe({
          next: () => {
            alert('Venue registered successfully!');
            this.resetForm();
            this.loadVenues();
            this.router.navigate(['admin/venueView']);
          },
          error: (error: HttpErrorResponse) => {
            alert('Failed to register venue: ' + error.message);
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });
      }
    } else {
      alert('Please fill in all required fields.');
    }
  }

  onCancel(): void {
    this.resetForm();
    this.router.navigate(['/admin/venueView']);
  }

  resetForm(): void {
    this.venueForm.reset();
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.isEditing = false;
    this.VenueId = null;
  }

  deleteVenue(venueId: number): void {
    if (confirm('Are you sure you want to delete this venue?')) {
      this.venueService.deleteVenue(venueId).subscribe(
        () => {
          this.loadVenues();
        },
        (error: HttpErrorResponse) => {
          alert('Failed to delete venue: ' + error.message);
        }
      );
    }
  }
}
