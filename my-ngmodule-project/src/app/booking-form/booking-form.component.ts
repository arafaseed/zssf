import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../booking.service';
import { VenueService } from '../venue-service.service';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  standalone: false,
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  booking = {
    fullName: '',
    phoneNumber: '',
    startDate: new Date(),
    startTime: '',
    endDate: new Date(),
    endTime: '',
    status: 'RESERVATION_PENDING',
    venue: { id: null, description: '' }
  };

  venueId: number | undefined;
  description: string | null = null;

  constructor(
    private bookingService: BookingService,
    private venueService: VenueService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.venueId = params['venue_id'];
      this.description = params['description'];
      console.log('Venue ID:', this.venueId);

      if (this.venueId) {
        this.venueService.getVenueById(this.venueId).subscribe(venue => {
          this.booking.venue.id = venue.venueId;
          this.booking.venue.description = venue.description;
        }, error => {
          console.error('Error fetching venue details:', error);
        });
      }
    });
  }

  onDateChange() {
    if (this.booking.startDate) {
      this.booking.endDate = this.booking.startDate;
    }
  }

  onSubmit() {
    const bookingData = {
      fullName: this.booking.fullName,
      phoneNumber: this.booking.phoneNumber,
      startDate: this.booking.startDate.toISOString(),
      startTime: this.booking.startTime,
      endDate: this.booking.endDate.toISOString(),
      endTime: this.booking.endTime,
      status: this.booking.status,
      venue: this.booking.venue
    };

    console.log('Booking Data:', bookingData);

    this.bookingService.createBooking(bookingData).subscribe(
      response => {
        console.log('Booking created successfully:', response);
        this.resetForm();
        // this.goToBookingPage(this.venueId);
      },
      error => {
        console.error('Error creating booking:', error);
      }
    );
  }

  resetForm() {
    this.booking = {
      fullName: '',
      phoneNumber: '',
      startDate: new Date(),
      startTime: '',
      endDate: new Date(),
      endTime: '',
      status: 'RESERVATION_PENDING',
      venue: { id: null, description: '' }
    };
  }

  // goToBookingPage(venueId: number | undefined): void {
  //   if (venueId !== undefined) {
  //     this.router.navigate(['/booking', venueId]);
  //   } else {
  //     console.error('Venue ID is undefined:', venueId);
  //   }
  // }
}
