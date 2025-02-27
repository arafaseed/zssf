import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../booking.service';


@Component({
  selector: 'app-booking-form',
  standalone: false,
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  bookingForm!: FormGroup;
  venues: any[] = [];

  constructor(private fb: FormBuilder, private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      venueId: ['', Validators.required]
    });
<<<<<<< HEAD
  }
  ngOnInit(): void {
    
    
=======

    this.loadVenues();
>>>>>>> a25b6339b2dcd4d7d13997d0265b6ca46d07b3cf
  }

  loadVenues(): void {
    this.bookingService.getVenues().subscribe((data: any[]) => {
      this.venues = data;
    });
  }

  submitBooking(): void {
    if (this.bookingForm.valid) {
      this.bookingService.createBooking(this.bookingForm.value).subscribe(() => {
        alert('Booking Successful!');
        this.bookingForm.reset();
      });
    }
  }
}

