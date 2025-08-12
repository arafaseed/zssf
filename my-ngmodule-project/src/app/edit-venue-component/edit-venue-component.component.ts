import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewVenueService } from '../Services/view-venue.service';

@Component({
  selector: 'app-edit-venue',
  templateUrl: './edit-venue.component.html',
  standalone:false,
  styleUrls: ['./edit-venue.component.css']
})
export class EditVenueComponent implements OnInit {
  venueForm!: FormGroup;
  venueId: number;

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
      description: [''],
      buildingId: ['', Validators.required]
    });

    this.loadVenue();
  }

  loadVenue(): void {
    this.venueService.getVenueById(this.venueId).subscribe(venue => {
      this.venueForm.patchValue({
        venueName: venue.venueName,
        capacity: venue.capacity,
        description: venue.description,
        buildingId: venue.buildingId
      });
    });
  }

  onSubmit(): void {
    if (this.venueForm.invalid) return;

    this.venueService.updateVenue(this.venueId, this.venueForm.value).subscribe(() => {
      alert('Venue updated successfully!');
      this.dialogRef.close(true);  // Close dialog and return true
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
