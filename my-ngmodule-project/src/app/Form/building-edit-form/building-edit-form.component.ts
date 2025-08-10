import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { BuildinglistService } from '../../Services/buildinglist.service';

@Component({
  selector: 'app-building-edit-form',
  templateUrl: './building-edit-form.component.html',
  standalone:false,
  styleUrls: ['./building-edit-form.component.css']
})
export class BuildingEditFormComponent implements OnInit {
  buildingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private buildingService: BuildinglistService,
    private dialogRef: MatDialogRef<BuildingEditFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { buildingId: number }
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    if (this.data?.buildingId) {
      this.loadBuildingDetails(this.data.buildingId);
    }
  }

  initializeForm(): void {
    this.buildingForm = this.fb.group({
      buildingName: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  loadBuildingDetails(buildingId: number): void {
    this.buildingService.getBuildingById(buildingId).subscribe({
      next: (building) => {
        this.buildingForm.patchValue({
          buildingName: building.buildingName,
          address: building.address
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading building:', error);
        alert('Failed to load building details.');
      }
    });
  }

  onSubmit(): void {
    if (this.buildingForm.valid) {
      this.buildingService.updateBuilding(this.data.buildingId, this.buildingForm.value).subscribe({
        next: () => {
          alert('Building updated successfully!');
          this.dialogRef.close(true);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating building:', error);
          alert('Failed to update building.');
        }
      });
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
