// import { Component, OnInit } from '@angular/core';
// import { StaffBookingService } from '../../staff-booking.service';

// interface Booking {
//   bookingCode: string;
//   venueName: string;
//   packageName: string;
//   price: number;
//   customerName: string;
//   customerPhone: string;
//   // ...any other fields
// }

// @Component({
//   selector: 'app-check-in-list',
//   templateUrl: './check-in-list.component.html',
//   styleUrls: ['./check-in-list.component.css']
// })
// export class CheckInListComponent implements OnInit {
//   bookings: Booking[] = [];
//   staffIDN = 'ZSSF/ADMIN-000001';  // Replace with actual from auth

//   constructor(private bookingService: StaffBookingService) {}

//   ngOnInit(): void {
//     this.loadPendingBookings();
//   }

//   loadPendingBookings(): void {
//     // TODO: Replace with real endpoint for pending bookings
//     this.bookingService.getAllBookings().subscribe((data: Booking[]) => {
//       // Filter those needing check-in (e.g., !checkedIn && !cancelled)
//       this.bookings = data.filter(b => !b['checkedIn'] && !b['cancelled']);
//     });
//   }

//   onCheckIn(booking: Booking): void {
//     this.bookingService
//       .checkIn(booking.bookingCode, this.staffIDN)
//       .subscribe({
//         next: () => {
//           // Remove from list
//           this.bookings = this.bookings.filter(b => b.bookingCode !== booking.bookingCode);
//         },
//         error: err => {
//           console.error('Check-in failed', err);
//           // Optionally show a toast or alert
//         }
//       });
//   }
// }
