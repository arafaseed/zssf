import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BuildingService } from '../../Services/building.service';

@Component({
  selector: 'app-majengo',
  standalone: false,
  templateUrl: './majengo.component.html',
  styleUrls: ['./majengo.component.css']
})
export class MajengoComponent {
  majengoForm: FormGroup;

  constructor(private fb: FormBuilder, private buildingService: BuildingService) {
    this.majengoForm = this.fb.group({
      buildingId: [null],  // Optional field
      buildingName: ['', Validators.required],
      address: ['', Validators.required],
      venue: ['', Validators.required] // Changed to a single input field
    });
  }

  // Submit handler
  onSubmit() {
    if (this.majengoForm.valid) {
      // console.log('Submitting Data:', this.majengoForm.value);
      this.buildingService.addBuilding(this.majengoForm.value).subscribe(
        (response: any) => {
          // console.log('Building added successfully:', response);
        },
        (error: any) => {
          console.error('There was an error!', error);
        }
      );
    } else {
      console.error("Form is invalid!");
    }
  }
}
