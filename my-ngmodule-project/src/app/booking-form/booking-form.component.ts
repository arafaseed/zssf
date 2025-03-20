import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BookingService } from '../Services/booking.service';

@Component({
  selector: 'app-booking-form',
  standalone: false,
  providers: [BookingService, DatePipe],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {
  currentMonth: Date = new Date();
  isSelectingStart: boolean = true;
  selectionIndicator: string = 'Please select the start date and time';

  selectedStartDate: string = '';
  selectedEndDate: string = '';
  selectedStartTime: string = '';
  selectedEndTime: string = '';

  fullName: string = '';
  phoneNumber: string = '';
  email: string = '';
  physicalAddress: string = '';

  availableTimes: string[] = [];
  allTimes: string[] = [
    '08:00:00', '10:00:00', '12:00:00',
    '14:00:00', '16:00:00', '18:00:00', '20:00:00', '22:00:00', '00:00:00'
  ];

  bookedDates: string[] = [];
  calendarDates: { date: string; isBooked: boolean }[] = [];

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.generateCalendar();
    this.fetchBookedDates();
  }

  checkAvailabilityForTime(selectedTime: string): void {
    console.log('Checking availability for:', selectedTime);
  }

  changeMonth(months: number): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + months,
      1
    );
    this.generateCalendar();
    this.fetchBookedDates();
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toISOString().split('T')[0];

    this.calendarDates = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1).toISOString().split('T')[0];
      return date >= today ? { date, isBooked: this.bookedDates.includes(date) } : null;
    }).filter((date): date is { date: string; isBooked: boolean } => date !== null);

    this.cdr.markForCheck();
  }

  fetchBookedDates(): void {
    const venue = JSON.parse(localStorage.getItem('selectedVenue') || '{}');
    if (!venue.venueId) return;

    this.bookingService.getBookedDates(venue.venueId).subscribe(dates => {
      this.bookedDates = dates;
      this.generateCalendar();
    });
  }

  selectDate(date: string): void {
    this.selectedStartDate = date;
    this.selectionIndicator = 'Now select the start time';
  }

  async makeReservation(): Promise<void> {
    if (!this.selectedStartDate || !this.selectedStartTime || !this.selectedEndDate || !this.selectedEndTime) {
      alert('Please select date and time before proceeding.');
      return;
    }

    const venue = JSON.parse(localStorage.getItem('selectedVenue') || '{}');
    if (!venue.venueId) {
      alert('No venue selected.');
      return;
    }

    const bookingData = {
      fullName: this.fullName,
      phoneNumber: this.phoneNumber,
      email: this.email || '',
      physicalAddress: this.physicalAddress || '',
      startDate: this.selectedStartDate,
      startTime: this.selectedStartTime,
      endDate: this.selectedEndDate,
      endTime: this.selectedEndTime,
      status: 'RESERVATION_PENDING',
      venue: { venueId: venue.venueId },
    };

    try {
      const response = await this.bookingService.createBooking(bookingData).toPromise();
      localStorage.setItem('bookingData', JSON.stringify({ ...response, timestamp: new Date().toISOString() }));
      this.router.navigate(['/payment-receipt']);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('There was an issue saving the reservation. Please try again.');
    }
  }
}
