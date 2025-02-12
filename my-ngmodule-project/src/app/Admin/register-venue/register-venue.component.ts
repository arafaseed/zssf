import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenueService } from '../../venue-service.service';
@Component({
  selector: 'app-register-venue',
  standalone: false,
  templateUrl: './register-venue.component.html',
  styleUrls: ['./register-venue.component.scss']
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
      leasePackageIds: [[]],
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
      const venueData = {
        venueName: formValue.venueName,
        capacity: formValue.capacity,
        description: formValue.description,
        building: { buildingId: formValue.buildingId }, // Ensure nested "building" object
        leasePackages: formValue.leasePackageIds.map((id: number) => ({ leaseId: id })) // Array of { leaseId }
      };
      formData.append("venue", JSON.stringify(venueData));
      if (this.selectedFiles) {
        this.selectedFiles.forEach(file => {
          formData.append("images", file);
        });
      }
      this.venueService.registerVenue(formData).subscribe(
        (        response: any) => {
          console.log("Venue registered successfully:", response);
          this.venueForm.reset();
          this.selectedFiles = null;
        },
        (        error: any) => console.error("Error registering venue:", error)
      );
    }
  }
}