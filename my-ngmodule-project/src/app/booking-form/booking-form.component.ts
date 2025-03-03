import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../booking.service';
import { VenueService } from '../venue-service.service';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  standalone: false,
  styleUrls: ['./booking-form.component.css'],
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  bookingData: any = {}; // Initialize the bookingData object
  venues: { venueId: number }[] = []; // Array of venues with only venueId

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private venueService: VenueService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getVenues(); // Fetch venues when the component initializes
  }

  initializeForm() {
    this.bookingForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10}$')],
      ], // Adjust phone pattern as necessary
      startDate: ['', Validators.required],
      startTime: ['', Validators.required], // Added startTime control
      endDate: ['', Validators.required],
      endTime: ['', Validators.required], // Added endTime control
      venue_id: ['', Validators.required],
      status: ['RESERVATION_PENDING', Validators.required], // Default value of status
    });
  }

  getVenues() {
    this.venueService.getVenues().subscribe((venues) => {
      this.venues = venues;
    });
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const bookingData = this.bookingForm.value;
  
  
    // Format the start and end datetime fields in ISO 8601 format with UTC timezone
    const startDateTime = new Date(
      `${bookingData.startDate}T${bookingData.startTime}`
    ).toISOString();  // This will generate a UTC-based ISO string like '2025-03-04T06:44:14.000Z'
    
    const endDateTime = new Date(
      `${bookingData.endDate}T${bookingData.endTime}`
    ).toISOString(); // Same here, ensuring it's in UTC

    // Format startTime and endTime as "HH:mm:ss"
    const startTimeFormatted = this.formatTime(bookingData.startTime);
    const endTimeFormatted = this.formatTime(bookingData.endTime);
  
      // Construct the formatted booking data
      const formattedBookingData = {
        fullName: bookingData.fullName,
        phoneNumber: bookingData.phoneNumber,
        startDate: startDateTime, // Formatted start date
        startTime: startTimeFormatted, // Formatted start time (HH:mm:ss)
        endDate: endDateTime, // Formatted end date
        endTime: endTimeFormatted, // Formatted end time (HH:mm:ss)
        venue_id: bookingData.venue_id,
        status: bookingData.status, // Default status
      };
  
      console.log('Formatted Booking Data:', formattedBookingData);
  
      // Make sure bookingService is properly injected and available
      this.bookingService.createBooking(formattedBookingData).subscribe(
        (response) => {
          console.log('Booking created successfully', response);
          this.bookingForm.reset();
        },
        (error) => {
          console.error('Error creating booking', error);
        }
      );
    }
  }
  
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}:00`; // Ensure the time is in "HH:mm:ss" format
  }
}  