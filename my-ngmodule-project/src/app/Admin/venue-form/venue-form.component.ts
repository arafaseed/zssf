import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-venue-form',
  templateUrl: './venue-form.component.html',
  standalone: false,
  styleUrls: ['./venue-form.component.css']
})
export class VenueFormComponent {
  venueForm: FormGroup;
  private apiUrl = '/api/buildings';

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.venueForm = this.fb.group({
      buildingName: ['', Validators.required],
      address: ['', Validators.required]
    });
  }

  addVenue(): void {
    if (this.venueForm.valid) {
      this.http.post(this.apiUrl + '/add', this.venueForm.value).subscribe(() => {
        this.venueForm.reset();
      });
    }
  }
}