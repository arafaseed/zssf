import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenueService } from '../../venue-service.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register-venue',
  templateUrl: './register-venue.component.html',
  standalone:false,
  styleUrls: ['./register-venue.component.css']
})
export class RegisterVenueComponent implements OnInit {
  venueForm!: FormGroup;
  selectedFiles: File[] | null = null;
  buildings: any[] = [];
 

  constructor(private fb: FormBuilder, private venueService: VenueService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadBuildings();

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
      (error: any) => console.error("Error fetching buildings:", error)
    );
  }


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onSubmit(): void {
    if (this.venueForm.valid) {
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

      this.venueService.registerVenue(formData).subscribe(
        (response: any) => {
          console.log("Venue registered successfully:", response);
          alert("Venue registered successfully!");
          this.venueForm.reset();
          this.selectedFiles = null;
        },
        (error: HttpErrorResponse) => {
          console.error("Error registering venue:", error);
          alert("Failed to register venue: " + error.message);
        }
      );
    } else {
      console.error("Form is invalid:", this.venueForm.errors);
      alert("Please fill in all required fields.");
    }
  }

  deleteVenue(venueId: number) {
    this.venueService.deleteVenue(venueId).subscribe({
      next: () => console.log('Venue deleted successfully'),
      error: (error) => console.error('Error deleting venue:', error)
    });
  }
  
}
