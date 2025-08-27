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
  submitted = false; // Track submit attempts

  // NEW: description list handling
  descriptionList: string[] = [];
  descriptionInput = '';

  // NEW: optional venueType choices (kept optional)
  venueTypes = ['In door', 'Out door'];

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
      // keep description control for compatibility but we will use descriptionList for submit
      description: [''],
      buildingId: ['', Validators.required],
      address: ['', Validators.required],      // NEW: address
      venueType: ['']                           // NEW: optional
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
      // Append new files to selectedFiles
      this.selectedFiles = [...this.selectedFiles, ...newFiles];

      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });

      // Clear input value so same file can be reselected if necessary
      input.value = '';
    }
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  // ---------- Description list helpers ----------
  addDescription(): void {
    const text = (this.descriptionInput || '').trim();
    if (!text) return;
    this.descriptionList.push(text);
    this.descriptionInput = '';
  }

  removeDescription(index: number): void {
    this.descriptionList.splice(index, 1);
  }

  // ---------- Edit flow ----------
  editVenue(venueId: number): void {
    this.venueService.getVenueById(venueId).subscribe(
      (venue: any) => {
        this.venueForm.patchValue({
          venueName: venue.venueName,
          capacity: venue.capacity,
          description: Array.isArray(venue.description) ? venue.description.join('\n') : (venue.description || ''),
          buildingId: venue.buildingId,
          address: venue.address ?? '',
          venueType: venue.venueType ?? ''
        });

        // populate descriptionList for UI preview if the backend returns an array
        if (Array.isArray(venue.description)) {
          this.descriptionList = [...venue.description];
        } else if (typeof venue.description === 'string' && venue.description.trim()) {
          // fallback: attempt to split lines if description is a string
          this.descriptionList = venue.description.split('\n').map((s: string) => s.trim()).filter((s:string) => s);
        } else {
          this.descriptionList = [];
        }

        // NOTE: existing images often come as URLs from server — we do not add them to selectedFiles.
        // If you want to show existing server images as previews with "keep/remove" behavior, that is extra logic.
        this.isEditing = true;
        this.VenueId = venueId;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching venue details:', error);
        alert('Failed to load venue details.');
      }
    );
  }

  // ---------- Submit ----------
  onSubmit(): void {
    this.submitted = true; // Force validation messages to appear

    // Validate form basic controls AND ensure there is at least one description AND at least one image
    if (this.venueForm.invalid || this.selectedFiles.length === 0 || this.descriptionList.length === 0) {
      // show immediate feedback via template (submitted flag) and stop
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const formValue = this.venueForm.value;

    // Build venue JSON exactly in the shape the backend expects
    const venueData: any = {
      venueName: formValue.venueName,
      capacity: Number(formValue.capacity),
      venueType: formValue.venueType || null,
      address: formValue.address || null,
      description: [...this.descriptionList]
    };

    formData.append('venue', JSON.stringify(venueData));
    formData.append('buildingId', String(formValue.buildingId));

    // Append images with same field name 'images' (multiple parts)
    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

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
    this.submitted = false;
    this.descriptionList = [];
    this.descriptionInput = '';
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
