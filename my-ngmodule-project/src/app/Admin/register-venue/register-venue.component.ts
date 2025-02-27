import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenueService } from '../../venue-service.service';

@Component({
  selector: 'app-register-venue',
  standalone: false,
  templateUrl: './register-venue.component.html',
  styleUrls: ['./register-venue.component.css']
})
export class RegisterVenueComponent implements OnInit {
  venueForm!: FormGroup;
  selectedFiles: File[] | null = null;
  buildings: any[] = [];
  leasePackages: any[] = [];
  isLoading = false; // For loading state during API requests
  successMessage: string | null = null; // To show success message
  errorMessage: string | null = null; // To show error message

  constructor(private fb: FormBuilder, private venueService: VenueService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadBuildings();
    this.loadLeasePackages();
  }

  // Initialize the form with validation
  initializeForm(): void {
    this.venueForm = this.fb.group({
      venueName: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      description: [''],
      buildingId: ['', Validators.required],
      leasePackageIds: [[]],
    });
  }

  // Load the available buildings from the service
  loadBuildings(): void {
    this.venueService.getBuildings().subscribe(
      (data: any[]) => this.buildings = data,
      (error: any) => console.error('Error fetching buildings:', error)
    );
  }

  // Load lease packages from the service
  loadLeasePackages(): void {
    this.venueService.getLeasePackages().subscribe(
      (data: any[]) => {
        console.log('Lease Packages from API:', data);
        this.leasePackages = data;
      },
      (error: any) => {
        console.error('Error fetching lease packages:', error);
        this.errorMessage = 'Failed to load lease packages. Please try again later.';
      }
    );
  }

  // Handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  // Handle form submission
  onSubmit(): void {
    if (this.venueForm.valid) {
      this.isLoading = true; // Start loading
      const formData = new FormData();
      const formValue = this.venueForm.value;
      const leasePackageIds = Array.isArray(formValue.leasePackageIds)
        ? formValue.leasePackageIds
        : [formValue.leasePackageIds];

      const venueData = {
        venueName: formValue.venueName,
        capacity: formValue.capacity,
        description: formValue.description,
        building: { buildingId: formValue.buildingId },
        leasePackages: leasePackageIds.map((id: number) => ({ leaseId: id }))
      };

      formData.append('venue', JSON.stringify(venueData));

      // Append selected files if any
      if (this.selectedFiles) {
        this.selectedFiles.forEach(file => {
          formData.append('images', file, file.name);
        });
      }

      // Make the API request to register the venue
      this.venueService.registerVenue(formData).subscribe(
        (response: any) => {
          console.log('Venue registered successfully:', response);
          this.successMessage = 'Venue registered successfully!';
          this.venueForm.reset();
          this.selectedFiles = null;
        },
        (error: any) => {
          console.error('Error registering venue:', error);
          this.errorMessage = 'Failed to register venue. Please try again.';
        },
        () => {
          this.isLoading = false; // Stop loading after the request completes
        }
      );
    }
  }
}
