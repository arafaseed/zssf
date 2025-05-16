// import { Component, OnInit } from '@angular/core';
// import { StaffBookingService } from '../../../services/venue-report.service';

// interface Booking {
//   bookingCode: string;
//   venueName: string;
//   packageName: string;
//   price: number;
//   customerName: string;
//   customerPhone: string;
//   endDateTime: string;   // ISO string
//   cancelled: boolean;
// }

// @Component({
//   selector: 'app-cancelled-list',
//   templateUrl: './cancelled-list.component.html',
//   styleUrls: ['./cancelled-list.component.css']
// })
// export class CancelledListComponent implements OnInit {
//   bookings: Booking[] = [];

//   constructor(private bookingService: StaffBookingService) {}

//   ngOnInit(): void {
//     this.loadCancelledAndExpired();
//   }

//   loadCancelledAndExpired(): void {
//     this.bookingService.getAllBookings().subscribe((data: Booking[]) => {
//       const now = new Date();
//       this.bookings = data.filter(b => 
//         b.cancelled ||
//         (b.endDateTime && new Date(b.endDateTime) < now)
//       );
//     });
//   }
// }