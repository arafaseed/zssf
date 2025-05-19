// import { Component, OnInit } from '@angular/core';
// import { StaffBookingService } from '../../../services/venue-report.service';

// interface Report {
//   reportId: number;
//   bookingCode: string;
//   forVenue: number;
//   forBooking: number;
//   checkInTime: string;   // ISO
//   checkOutTime: string;  // ISO
//   conditionStatus: string;
//   conditionDescription: string;
// }

// @Component({
//   selector: 'app-reports',
//   templateUrl: './reports.component.html',
//   styleUrls: ['./reports.component.css']
// })
// export class ReportsComponent implements OnInit {
//   reports: Report[] = [];
//   staffIDN = 'YOUR_LOGGED_IN_STAFF_IDN';

//   constructor(private bookingService: StaffBookingService) {}

//   ngOnInit(): void {
//     this.loadReports();
//   }

//   loadReports(): void {
//     this.bookingService.getReportsByStaffIDN(this.staffIDN)
//       .subscribe((data: Report[]) => {
//         this.reports = data;
//       }, err => {
//         console.error('Failed to load reports', err);
//       });
//   }
// }
