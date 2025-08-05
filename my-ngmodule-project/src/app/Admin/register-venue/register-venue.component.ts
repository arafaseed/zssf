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
  selectedFiles: File[] | null = null;
  buildings: any[] = [];
  isEditing = false;
  VenueId: number | null = null; // Store the venue ID being edited
  venues: any[] = []; // Updated: Initialize venues array as an empty array
   isSubmitting = false;

  constructor(private fb: FormBuilder, private venueService: VenueService, private router: Router) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadBuildings();
    this.loadVenues(); // Ensure venues are loaded when the component initializes
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
      (data: any[]) => this.buildings = data,
      (error: any) => {
        console.error("Error fetching buildings:", error);
        alert("Failed to load buildings.");
      }
    );
  }

  loadVenues(): void {
    this.venueService.getVenues().subscribe(
      (data: any[]) => this.venues = data,
      (error: any) => {
        console.error("Error fetching venues:", error);
        alert("Failed to load venues.");
      }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  editVenue(venueId: number): void {
    this.venueService.getVenueById(venueId).subscribe(
      (venue: any) => {
        this.venueForm.patchValue({
          venueName: venue.venueName,
          capacity: venue.capacity,
          description: venue.description,
          buildingId: venue.buildingId
        });
        this.isEditing = true;
        this.VenueId = venueId;
      },
      (error: HttpErrorResponse) => {
        console.error("Error fetching venue details:", error);
        alert("Failed to load venue details.");
      }
    );
  }

  onSubmit(): void {
    if (this.venueForm.valid) {
    this.isSubmitting = true; // Show spinner
      const formData = new FormData();
      const formValue = this.venueForm.value;

      const venueData = {
        venueName: formValue.venueName,
        capacity: formValue.capacity,
        description: formValue.description,
      };

      formData.append("venue", JSON.stringify(venueData));
      formData.append("buildingId", formValue.buildingId.toString());

      if (this.selectedFiles) {
        this.selectedFiles.forEach(file => {
          formData.append("images", file);
        });
      }

      if (this.isEditing && this.VenueId !== null) {
         this.isSubmitting = false; // Hide spinner
        // Update existing venue
        this.venueService.updateVenue(this.VenueId, formData).subscribe(
          (response: any) => {
            console.log("Venue updated successfully:", response);
            alert("Venue updated successfully!");
            this.resetForm();
            this.loadVenues(); // Refresh venue list
            this.router.navigate(['/venueView']);
          },
          (error: HttpErrorResponse) => {
            console.error("Error updating venue:", error);
            alert("Failed to update venue: " + error.message);
          }
        );
      } else {
        // Add new venue
        this.venueService.registerVenue(formData).subscribe(
          (response: any) => {
            this.isSubmitting = false; // Hide spinner
            console.log("Venue registered successfully:", response);
            alert("Venue registered successfully!");
            this.resetForm();
            this.loadVenues(); // Refresh venue list
            this.router.navigate(['admin/venueView']); 
          },
          (error: HttpErrorResponse) => {
            console.error("Error registering venue:", error);
            alert("Failed to register venue: " + error.message);
          }
        );
      }
    } else {
      console.error("Form is invalid:", this.venueForm.errors);
      alert("Please fill in all required fields.");
    }
    complete: () => {
        this.isSubmitting = false; // ✅ Only stop spinner after operation ends
      }
  }

  resetForm(): void {
    this.venueForm.reset();
    this.selectedFiles = null;
    this.isEditing = false;
    this.VenueId = null;
  }

  deleteVenue(venueId: number): void {
    if (confirm('Are you sure you want to delete this venue?')) {
      this.venueService.deleteVenue(venueId).subscribe(
        () => {
          this.loadVenues(); // Refresh venue list
        },
        (error: HttpErrorResponse) => {
          console.error('Error deleting venue:', error);
          alert('Failed to delete venue: ' + error.message);
        }
      );
    }
  }
}
