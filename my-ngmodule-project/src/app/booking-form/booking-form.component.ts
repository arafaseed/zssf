import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-booking-form',
  standalone:false,
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  venues: any[] = [];
  venueId: any;

  constructor(private fb: FormBuilder, private bookingService: BookingService) {}

  ngOnInit(): void {
    // Initialize the booking form
    this.bookingForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      venueId: ['', Validators.required]
    });

    // Load venues
    this.loadVenues();
  }

  // Load venues from the backend
  loadVenues(): void {
    this.bookingService.getVenues().subscribe(
      (data: any[]) => {
        this.venues = data;
        console.log('Loaded venues:', this.venues);  // Debugging the loaded data
      },
      (error) => {
        console.error('Error fetching venues', error);
      }
    );
  }

  // Submit the booking form
//   submitBooking(): void {
//     if (this.bookingForm.valid) {
//       console.log('Booking Data:', this.bookingForm.value); 
//       this.bookingService.createBooking(this.bookingForm.value).subscribe(() => {
//         alert('Booking Successful!');
//         this.bookingForm.reset();
//       });
//     }
//   }
// }
submitBooking() {
  const bookingData = {
    fullName: this.bookingForm.value.fullName,
    phoneNumber: this.bookingForm.value.phoneNumber,
    startDate: this.bookingForm.value.startDate,
    startTime: this.bookingForm.value.startTime,
    endDate: this.bookingForm.value.endDate,
    endTime: this.bookingForm.value.endTime,
    status: this.bookingForm.value.status,
    venue: {
      venueId: this.bookingForm.value.venueId // This will correctly fetch the selected venueId
    }
  };

  this.bookingService.createBooking(bookingData).subscribe({
    next: (response) => {
      console.log('Booking successful', response);
      // Handle success
    },
    error: (error) => {
      console.error('Error occurred:', error);
      // Handle error
    }
  });
}
}