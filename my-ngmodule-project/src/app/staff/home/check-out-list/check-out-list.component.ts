// import { Component, OnInit } from '@angular/core';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { StaffBookingService } from '../../../services/venue-report.service';
// import { CheckoutModalComponent } from '../../modals/checkout-modal/checkout-modal.component';

// interface Booking {
//   bookingCode: string;
//   venueName: string;
//   packageName: string;
//   price: number;
//   customerName: string;
//   customerPhone: string;
//   // plus a flag indicating checkedIn but not checkedOut
//   checkedIn: boolean;
//   checkedOut: boolean;
// }

// @Component({
//   selector: 'app-check-out-list',
//   templateUrl: './check-out-list.component.html',
//   styleUrls: ['./check-out-list.component.css']
// })
// export class CheckOutListComponent implements OnInit {
//   bookings: Booking[] = [];
//   staffIDN = 'YOUR_LOGGED_IN_STAFF_IDN';

//   constructor(
//     private bookingService: StaffBookingService,
//     private modalService: NgbModal
//   ) {}

//   ngOnInit(): void {
//     this.loadCheckOutBookings();
//   }

//   loadCheckOutBookings(): void {
//     this.bookingService.getAllBookings().subscribe((data: Booking[]) => {
//       this.bookings = data.filter(b => b.checkedIn && !b.checkedOut && !b.cancelled);
//     });
//   }

//   openCheckoutModal(booking: Booking): void {
//     const modalRef = this.modalService.open(CheckoutModalComponent, { centered: true });
//     modalRef.componentInstance.booking = booking;
//     modalRef.componentInstance.staffIDN = this.staffIDN;

//     modalRef.result.then((result) => {
//       if (result === 'checkedOut') {
//         // Remove from list
//         this.bookings = this.bookings.filter(b => b.bookingCode !== booking.bookingCode);
//       }
//     }).catch(() => {
//       // Modal dismissed
//     });
//   }
// }
