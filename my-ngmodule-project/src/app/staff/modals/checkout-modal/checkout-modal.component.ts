// import { Component, Input } from '@angular/core';
// import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { StaffBookingService } from '../../../services/venue-report.service';

// @Component({
//   selector: 'app-checkout-modal',
//   templateUrl: './checkout-modal.component.html',
//   styleUrls: ['./checkout-modal.component.css']
// })
// export class CheckoutModalComponent {
//   @Input() booking: any;
//   @Input() staffIDN: string;

//   form: FormGroup;
//   conditionStatuses = ['GOOD', 'FAIR', 'BAD', 'CRITICAL'];

//   constructor(
//     public activeModal: NgbActiveModal,
//     private fb: FormBuilder,
//     private bookingService: StaffBookingService
//   ) {
//     this.form = this.fb.group({
//       conditionStatus: ['', Validators.required],
//       conditionDescription: ['', Validators.required]
//     });
//   }

//   onSubmit(): void {
//     if (this.form.invalid) return;

//     const payload = {
//       bookingCode: this.booking.bookingCode,
//       staffIDN: this.staffIDN,
//       conditionStatus: this.form.value.conditionStatus,
//       conditionDescription: this.form.value.conditionDescription
//     };

//     this.bookingService.checkOut(payload).subscribe({
//       next: (res) => {
//         this.activeModal.close('checkedOut');
//       },
//       error: (err) => {
//         console.error('Check-out failed', err);
//         // Optionally show error
//       }
//     });
//   }
// }
