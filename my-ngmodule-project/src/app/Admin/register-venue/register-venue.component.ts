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
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private venueService: VenueService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadBuildings();
    this.loadLeasePackages();
  }

  // Initialize the form with proper validation
  initializeForm(): void {
    this.venueForm = this.fb.group({
      venueName: ['', [Validators.required, Validators.minLength(3)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      description: [''],
      buildingId: ['', Validators.required],
      leasePackageIds: [[]],
    });
  }

  // Fetch buildings from API
  loadBuildings(): void {
    this.venueService.getBuildings().subscribe(
      (data: any[]) => this.buildings = data,
      (error: any) => this.handleError('Failed to load buildings', error)
    );
  }

  // Fetch lease packages from API
  loadLeasePackages(): void {
    this.venueService.getLeasePackages().subscribe(
      (data: any[]) => this.leasePackages = data,
      (error: any) => this.handleError('Failed to load lease packages', error)
    );
  }

  // Handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      const files = Array.from(input.files);
  
      // Check file size (5MB max per file)
      const maxSize = 5 * 1024 * 1024; // 5MB
      for (const file of files) {
        if (file.size > maxSize) {
          this.errorMessage = `File ${file.name} is too large. Max allowed size is 5MB.`;
          return;
        }
      }
  
      this.selectedFiles = files;
    }
  }
  

  // Handle form submission
  onSubmit(): void {
    if (this.venueForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

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

    // Append files
    if (this.selectedFiles) {
      this.selectedFiles.forEach(file => formData.append('images', file, file.name));
    }

    // Send request to API
    this.venueService.registerVenue(formData).subscribe(
      (response: any) => {
        this.successMessage = 'Venue registered successfully!';
        this.venueForm.reset();
        this.selectedFiles = null;
      },
      (error: any) => {
        this.handleError('Failed to register venue', error);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  // Handle errors
  private handleError(message: string, error: any) {
    console.error(message, error);
    this.errorMessage = message;
    this.isLoading = false;
  }
}
