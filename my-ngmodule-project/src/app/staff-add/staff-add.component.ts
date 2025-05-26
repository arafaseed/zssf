import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffService } from '../Services/staff-view.service';


@Component({
  selector: 'app-staff-add',
  templateUrl: './staff-add.component.html',
  standalone:false,
  styleUrls: ['./staff-add.component.css']
})
export class StaffAddComponent implements OnInit {
  staffForm: FormGroup;
  staffList: any[] = [];
  showForm = false;
  roles = ['ADMIN', 'STAFF'];

  constructor(private fb: FormBuilder, private staffService: StaffService) {
    this.staffForm = this.fb.group({
      staffIDN: ['', Validators.required],
      fullName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStaff();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  loadStaff(): void {
    this.staffService.getAllStaff().subscribe({
      next: (data) => this.staffList = data,
      error: (err) => console.error('Error fetching staff', err)
    });
  }

  onSubmit(): void {
    if (this.staffForm.valid) {
      this.staffService.addStaff(this.staffForm.value).subscribe({
        next: () => {
          alert('Staff added successfully!');
          this.staffForm.reset();
          this.showForm = false;
          this.loadStaff();
        },
        error: (err) => {
          console.error(err);
          alert('Error adding staff');
        }
      });
    }
  }
}
