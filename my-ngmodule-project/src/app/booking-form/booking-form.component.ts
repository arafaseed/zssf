import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { BookingService } from '../booking.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  standalone:false,
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  bookingForm: FormGroup;

  constructor(private fb: FormBuilder, private bookingService: BookingService) {
    this.bookingForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      startDate: [null, Validators.required],
      startTime: [null, Validators.required],
      endDate: [null, Validators.required],
      endTime: [null, Validators.required],
      venueId: [null, Validators.required],
      status: ['PENDING', Validators.required]  // Default status is 'PENDING'
    });
  }
  ngOnInit(): void {
    
    
  }

  onSubmit(): void {
    if (this.bookingForm.valid) {
      const booking: BookingService = this.bookingForm.value;
      this.bookingService.createBooking(booking).subscribe(response => {
        console.log('Booking created:', response);
        alert('Booking successfully created!');
      }, error => {
        console.error('Error creating booking:', error);
        alert('An error occurred while creating the booking.');
      });
    }
  }
}

  // Check availability of the venue before submitting the booking
  // checkAvailability(): void {
  //   const { venueId, startDate, startTime } = this.bookingForm.value;
  //   this.bookingService.checkVenueAvailability(venueId, startDate, startTime).subscribe(isAvailable => {
  //     if (isAvailable) {
  //       this.submitBooking();
  //     } else {
  //       alert('Venue is not available at this time.');
  //     }
  //   });
  // }

