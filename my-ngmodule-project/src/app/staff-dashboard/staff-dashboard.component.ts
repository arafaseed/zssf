import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-staff-dashboard',
  standalone: false,
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.css'],
})
export class StaffDashboardComponent implements OnInit {
  staffName: string = 'John Doe';  // Sample staff name, replace with real data
  staffId: string = 'staff001';    // Sample staff ID, replace with real data

  constructor() {}

  ngOnInit(): void {
    // Initialize any staff-specific data here, such as fetching details from an API
  }

  // Define the performTask method that gets called when the button is clicked
  performTask() {
    // Logic for performing the task when the button is clicked
    console.log('Performing a staff task...');
    // You can add any action or API call here
  }
}
