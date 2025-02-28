import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  standalone:false,
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent {
  bookingForm: FormGroup;

  constructor(private fb: FormBuilder, private bookingService: BookingService) {
    this.bookingForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required],
      venueId: ['', Validators.required],
      status: ['PENDING'], // Default status
    });
  }

  onSubmit(): void {
    if (this.bookingForm.valid) {
      const bookingData = {
        fullName: this.bookingForm.value.fullName,
        phoneNumber: this.bookingForm.value.phoneNumber,
        startDate: this.bookingForm.value.startDate,
        startTime: this.bookingForm.value.startTime,
        endDate: this.bookingForm.value.endDate,
        endTime: this.bookingForm.value.endTime,
        status: 'PENDING', // or whatever default status you want
        venue: {
          venueId: this.bookingForm.value.venueId // Wrap venueId in a venue object
        }
      };

      console.log('Booking Data:', bookingData); // Log the data to check its structure
      this.bookingService.createBooking(bookingData).subscribe(
        response => {
          console.log('Booking created:', response);
        },
        error => {
          console.error('Error creating booking:', error); // Log the error for debugging
        }
      );
    }
  }
}