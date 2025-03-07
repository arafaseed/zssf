import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenueService } from '../venue-service.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-edit-venue-component',
  standalone: false,
  templateUrl: './edit-venue-component.component.html',
  styleUrls: ['./edit-venue-component.component.css']
})
export class EditVenueComponentComponent implements OnInit {
  venueForm!: FormGroup;
  selectedFiles: File[] | null = null;
  buildings: any[] = [];
  selectedBuildingName: string = ''; // Variable to store the selected building name

  constructor(
    private fb: FormBuilder,
    private venueService: VenueService,
    private dialogRef: MatDialogRef<EditVenueComponentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { venueId: number }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadBuildings();
    if (this.data.venueId) {
      this.loadVenueDetails(this.data.venueId);
    }
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
      (data: any[]) => {
        this.buildings = data;
        if (this.buildings.length > 0) {
          // You can set the first building as the default or leave it as is
          this.selectedBuildingName = this.buildings[0].buildingName;
        }
      },
      (error: any) => {
        console.error("Error fetching buildings:", error);
        alert("Failed to load buildings.");
      }
    );
  }
  

  loadVenueDetails(venueId: number): void {
    this.venueService.getVenueById(venueId).subscribe(
      (venue: any) => {
        console.log('Loading venue details:', venue);
        this.venueForm.patchValue({
          venueName: venue.venueName,
          capacity: venue.capacity,
          description: venue.description,
          buildingId: venue.buildingId
        });

        // Set the selected building name after patching the form
        const selectedBuilding = this.buildings.find(building => building.buildingId === venue.buildingId);
        if (selectedBuilding) {
          this.selectedBuildingName = selectedBuilding.buildingName;
        }

        console.log('Form value after patch:', this.venueForm.value);
      },
      (error: HttpErrorResponse) => {
        console.error("Error fetching venue details:", error);
        alert("Failed to load venue details.");
      }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onSubmit(): void {
    if (this.venueForm.valid && this.data.venueId !== null) {
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

      this.venueService.updateVenue(this.data.venueId, formData).subscribe(
        (response: any) => {
          console.log("Venue updated successfully:", response);
          alert("Venue updated successfully!");
          this.dialogRef.close(true); // Close the modal and pass true as a result
        },
        (error: HttpErrorResponse) => {
          console.error("Error updating venue:", error);
          alert("Failed to update venue: " + error.message);
        }
      );
    } else {
      console.error("Form is invalid:", this.venueForm.errors);
      alert("Please fill in all required fields.");
    }
  }

  closeDialog(): void {
    this.dialogRef.close(); // Close modal without returning any result
  }

  // Method to update the selected building name when the dropdown value changes
  onBuildingChange(): void {
    const selectedBuildingId = this.venueForm.get('buildingId')?.value;
    const selectedBuilding = this.buildings.find(building => building.buildingId === selectedBuildingId);
    this.selectedBuildingName = selectedBuilding ? selectedBuilding.buildingName : '';
  }
}
