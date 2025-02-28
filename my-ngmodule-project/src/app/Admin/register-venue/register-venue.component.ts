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
  leasePackages: any[] = [];

  constructor(private fb: FormBuilder, private venueService: VenueService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadBuildings();
    this.loadLeasePackages();
  }

  initializeForm(): void {
    this.venueForm = this.fb.group({
      venueName: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      description: [''],
      buildingId: ['', Validators.required],
      leasePackageIds: [''], // Single selection
    });
  }

  loadBuildings(): void {
    this.venueService.getBuildings().subscribe((data: any[]) => this.buildings = data);
  }

  loadLeasePackages(): void {
    this.venueService.getLeasePackages().subscribe(
      (data: any[]) => {
        console.log("Lease Packages from API:", data);  // Debugging log
        this.leasePackages = data;
      },
      (error: any) => console.error("Error fetching lease packages:", error)
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

      // Prepare venue data
      const venueData = {
        venueName: formValue.venueName,
        capacity: formValue.capacity,
        description: formValue.description,
        buildingId: formValue.buildingId, // Ensure this is included
        leasePackages: formValue.leasePackageIds ? [{ leaseId: formValue.leasePackageIds }] : [] // Prepare lease package
      };

      // Append venue data
      formData.append("venue", JSON.stringify(venueData));

      // Append buildingId
      formData.append("buildingId", formValue.buildingId.toString()); // Ensure this is included as a string

      // Append files
      if (this.selectedFiles) {
        this.selectedFiles.forEach(file => {
          formData.append("images", file);
        });
      }

      // Log FormData for debugging
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Send the request
      this.venueService.registerVenue(formData).subscribe(
        (response: any) => {
          console.log("Venue registered successfully:", response);
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
}