import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffViewService } from '../Services/staff-view.service';


@Component({
  selector: 'app-staff-add',
  templateUrl: './staff-add.component.html',
  standalone:false,
  styleUrls: ['./staff-add.component.css']
})
export class StaffAddComponent implements OnInit {
  staffForm: FormGroup;
  staffList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private staffService: StaffViewService
  ) {
    this.staffForm = this.fb.group({
      staffIdentification: ['', Validators.required],
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStaff();
  }

  onSubmit(): void {
    if (this.staffForm.valid) {
      this.staffService.addStaff(this.staffForm.value).subscribe(() => {
        alert('Staff added successfully');
        this.staffForm.reset();
        this.loadStaff();
      });
    }
  }

  loadStaff(): void {
    this.staffService.getAllStaff().subscribe(data => {
      this.staffList = data;
    });
  }

  deleteStaff(staffId: number): void {
    this.staffService.deleteStaff(staffId).subscribe(() => {
      alert('Staff deleted');
      this.loadStaff();
    });
  }

  updateStaff(staff: any): void {
    const updatedData = {
      staffIdentification: staff.staffIdentification,
      fullName: staff.fullName,
      phoneNumber: staff.phoneNumber,
      password: staff.password,
      role: staff.role
    };

    this.staffService.updateStaff(staff.staffId, updatedData).subscribe(() => {
      alert('Staff updated');
      this.loadStaff();
    });
  }
}
