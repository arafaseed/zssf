import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BuildinglistService } from '../Services/buildinglist.service';

@Component({
  selector: 'app-add-building',
  templateUrl: './add-building.component.html',
  standalone: false,
  styleUrls: ['./add-building.component.css']
})
export class AddBuildingComponent implements OnInit {
  buildingForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private buildingService: BuildinglistService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.buildingForm = this.fb.group({
      buildingName: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {

  }

  onSubmit(): void {
    if (this.buildingForm.valid) {
      this.isSubmitting = true;

      this.buildingService.addBuilding(this.buildingForm.value).subscribe({
        next: () => {
          this.buildingForm.reset();
          this.router.navigate(['/admin/buildings']);
        },
        error: (err) => this.showToast('Failed to add building: ' + err.message, 'error'),
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/buildings']);
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}
