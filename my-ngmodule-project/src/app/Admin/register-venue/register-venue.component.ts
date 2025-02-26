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
  constructor(private fb: FormBuilder, private venueService: VenueService) {}
  ngOnInit(): void {
    this.initializeForm();
    this.loadBuildings();
    this.loadLeasePackages();
  }
  initializeForm(): void {
    this.venueForm = this.fb.group({
      venueName: ['', Validators.required],
      // capacity: ['', [Validators.required, Validators.min(1)]],
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
        const leasePackageIds = Array.isArray(formValue.leasePackageIds) 
        ? formValue.leasePackageIds 
        : [formValue.leasePackageIds];
        const venueData = {
                  venueName: formValue.venueName,
                  // capacity: formValue.capacity,
                  description: formValue.description,
                  building: { buildingId: formValue.buildingId },
                  leasePackages: leasePackageIds.map((id: number) => ({ leaseId: id }))
                };
        // Form data preparation...
        
        // Append venue data
        formData.append("venue", JSON.stringify(venueData));
    
        // Append files
        if (this.selectedFiles) {
          this.selectedFiles.forEach(file => {
            formData.append("images", file);
          });
        }
    
        // Remove any manually set Content-Type header if you had it
        this.venueService.registerVenue(formData).subscribe(
          (response: any) => {
            console.log("Venue registered successfully:", response);
            this.venueForm.reset();
            this.selectedFiles = null;
          },
          (error: any) => {
            console.error("Error registering venue:", error);
          }
        );
      }
    }
  }


//     if (this.venueForm.valid) {
//       const formData = new FormData();
//       const formValue = this.venueForm.value;
      
//       const leasePackageIds = Array.isArray(formValue.leasePackageIds) 
//         ? formValue.leasePackageIds 
//         : [formValue.leasePackageIds];
  
//       const venueData = {
//         venueName: formValue.venueName,
//         capacity: formValue.capacity,
//         description: formValue.description,
//         building: { buildingId: formValue.buildingId },
//         leasePackages: leasePackageIds.map((id: number) => ({ leaseId: id }))
//       };
  
//       // Append the venue data to FormData
//       formData.append("venue", JSON.stringify(venueData));
  
//       // Log the FormData to check the content
//       for (let [key, value] of formData.entries()) {
//         console.log(key, value);
//       }
  
//       if (this.selectedFiles) {
//         this.selectedFiles.forEach(file => {
//           formData.append("images", file);
//         });
//       }
  
//       // Log files being appended (optional)
//       if (this.selectedFiles) {
//         console.log("Files being sent:", this.selectedFiles);
//       }
  
//       this.venueService.registerVenue(formData).subscribe(
//         (response: any) => {
//           console.log("Venue registered successfully:", response);
//           this.venueForm.reset();
//           this.selectedFiles = null;
//         },
//         (error: any) => {
//           console.error("Error registering venue:", error);
//         }
//       );
//     }
//   }

  
  
// }
