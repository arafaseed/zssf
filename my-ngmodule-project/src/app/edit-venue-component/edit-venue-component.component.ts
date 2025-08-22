import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewVenueService } from '../Services/view-venue.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-edit-venue-component',
  templateUrl: './edit-venue-component.component.html',
  styleUrls: ['./edit-venue-component.component.css'],
  standalone: false,
})
export class EditVenueComponent implements OnInit {
  venueForm!: FormGroup;
  venueId: number;
  buildings: any[] = [];
  submitted = false;
  isSubmitting = false;

  // Description
  descriptionList: string[] = [];
  descriptionInput = '';

  // Images
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  existingImages: { url: string, id: string }[] = [];

  venueTypes = ['In door', 'Out door', 'Hybrid'];

  constructor(
    private fb: FormBuilder,
    private venueService: ViewVenueService,
    private dialogRef: MatDialogRef<EditVenueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { venueId: number }
  ) {
    this.venueId = data.venueId;
  }

  ngOnInit(): void {
    this.venueForm = this.fb.group({
      venueName: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      address: ['', Validators.required],
      buildingId: ['', Validators.required],
      venueType: ['']
    });

    this.loadBuildings();
    this.loadVenue();
  }

  loadBuildings(): void {
    this.venueService.getBuildings().subscribe(
      data => this.buildings = data,
      (error: HttpErrorResponse) => {
        console.error('Error loading buildings:', error);
        alert('Failed to load buildings.');
      }
    );
  }

  loadVenue(): void {
    this.venueService.getVenueById(this.venueId).subscribe(
      venue => {
        this.venueForm.patchValue({
          venueName: venue.venueName,
          capacity: venue.capacity,
          address: venue.address || '',
          buildingId: venue.buildingId,
          venueType: venue.venueType || ''
        });

        // Description
        if (Array.isArray(venue.description)) {
          this.descriptionList = [...venue.description];
        } else if (venue.description?.trim()) {
          this.descriptionList = (venue.description as string).split('\n').map((s: string) => s.trim()).filter(s => s.length > 0);
        }

        // Existing images
        if (venue.venueImages && Array.isArray(venue.venueImages)) {
          this.existingImages = venue.venueImages.map((img: string, index: number) => ({ url: img, id: `existing-${index}` }));
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error loading venue:', error);
        alert('Failed to load venue details.');
      }
    );
  }

  // Description helpers
  addDescription(): void {
    const text = (this.descriptionInput || '').trim();
    if (!text) return;
    this.descriptionList.push(text);
    this.descriptionInput = '';
  }

  removeDescription(index: number): void {
    this.descriptionList.splice(index, 1);
  }

  // Image helpers
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const newFiles = Array.from(input.files);
      this.selectedFiles = [...this.selectedFiles, ...newFiles];

      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => this.imagePreviews.push(e.target.result);
        reader.readAsDataURL(file);
      });

      input.value = '';
    }
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  // Remove an existing image explicitly
  removeExistingImage(index: number): void {
    this.existingImages.splice(index, 1);
  }

  // Submit
onSubmit(): void {
  this.submitted = true;

  if (this.venueForm.invalid || this.descriptionList.length === 0) {
    return;
  }

  this.isSubmitting = true; // start spinner

  // Check total images
  const totalImages = this.existingImages.length + this.selectedFiles.length;
  if (totalImages < 3 || totalImages > 10) {
    alert('Total images must be between 3 and 10.');
    this.isSubmitting = false;
    return;
  }

  const formData = new FormData();
  const formValue = this.venueForm.value;

  const venuePayload = {
    venueName: formValue.venueName,
    capacity: formValue.capacity,
    address: formValue.address,
    venueType: formValue.venueType,
    description: this.descriptionList
  };
  formData.append('venue', JSON.stringify(venuePayload));
  formData.append('buildingId', String(formValue.buildingId));

  this.existingImages.forEach(img => formData.append('existingImages', img.url));
  this.selectedFiles.forEach(file => formData.append('images', file));

  this.venueService.updateVenue(this.venueId, formData).subscribe({
    next: () => {
      alert('Venue updated successfully!');
      this.dialogRef.close(true);
    },
    error: (error: HttpErrorResponse) => {
      console.error('Update error:', error);
      alert('Failed to update venue: ' + error.message);
    },
    complete: () => this.isSubmitting = false // stop spinner
  });
}

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
