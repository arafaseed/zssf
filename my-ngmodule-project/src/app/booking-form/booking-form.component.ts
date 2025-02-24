import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  standalone: false,
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  venueId?: number;

  booking: {
    fullName: string;
    phoneNumber: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    venueId?: number;
  } = {
    fullName: '',
    phoneNumber: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    venueId: undefined
  };

  // Calendar properties
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  daysOfWeek: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  currentDate: Date = new Date();
  month: number = this.currentDate.getMonth();
  year: number = this.currentDate.getFullYear();
  calendarDays: { date: number; available: boolean }[] = [];

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const venueIdParam = params['venueId'];
      if (venueIdParam) {
        this.venueId = +venueIdParam; // Convert string to number
        this.booking.venueId = this.venueId;
      }
    });
    this.generateCalendar();
  }

  // Method to change the month
  changeMonth(step: number): void {
    this.month += step;
    if (this.month < 0) {
      this.month = 11;
      this.year--;
    } else if (this.month > 11) {
      this.month = 0;
      this.year++;
    }
    this.generateCalendar();
  }

  // Generate the calendar days for the current month
  generateCalendar(): void {
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();

    this.calendarDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push({ date: i, available: true });
    }
  }

  // Check if a date is selected
  isDateSelected(day: { date: number }): boolean {
    return this.booking.startDate === this.formatDate(new Date(this.year, this.month, day.date));
  }

  // Handle date selection
  onDateSelect(day: { date: number }): void {
    const selectedDate = this.formatDate(new Date(this.year, this.month, day.date));
    this.booking.startDate = selectedDate;
    this.booking.endDate = selectedDate; // Assuming same start & end date
  }

  // Format date as YYYY-MM-DD
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Format time (for consistency)
  formatTime(time: string): string {
    return time ? new Date(`1970-01-01T${time}`).toTimeString().split(' ')[0] : '';
  }

  submitForm(): void {
    const formattedBooking = {
      ...this.booking,
      startDate: this.formatDate(new Date(this.booking.startDate)),
      endDate: this.formatDate(new Date(this.booking.endDate)),
      startTime: this.formatTime(this.booking.startTime),
      endTime: this.formatTime(this.booking.endTime),
    };

    console.log("Booking Request Payload:", formattedBooking);

    this.bookingService.registerBooking(formattedBooking).subscribe(
      response => console.log('Booking successful!', response),
      error => console.error('Error booking:', error)
    );
  }
}
