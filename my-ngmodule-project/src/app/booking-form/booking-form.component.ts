import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { BookingService } from '../Services/booking.service';

@Component({
  selector: 'app-booking-form',
  standalone:false,
  providers: [BookingService, DatePipe],
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent implements OnInit {

 
  // Calendar and selection management
  currentMonth: Date = new Date();
  isSelectingStart: boolean = true;
  selectionIndicator: string = 'Please select the start date and time';

  // Date/Time Selections
  selectedStartDate: string = '';
  selectedEndDate: string = '';
  selectedStartTime: string = '';
  selectedEndTime: string = '';

  // User Info
  fullName: string = '';
  phoneNumber: string = '';
  email: string = '';
  physicalAddress: string = '';

  // Configuration
  availableTimes: string[] = [
    '08:00:00', '10:00:00', '12:00:00',
    '14:00:00', '16:00:00', '18:00:00',
    '20:00:00', '22:00:00', '00:00:00'
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

  changeMonth(months: number): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + months,
      1
    );
    this.generateCalendar();
    this.fetchBookedDates();
  }
  

  getDateClasses(calendarDate: any): string {
    const baseClasses = 'p-2 text-center rounded-lg transition-colors ';
    if (calendarDate.isBooked) {
      return `${baseClasses} bg-gray-300 cursor-not-allowed`;
    }
    if (calendarDate.date === this.selectedStartDate || calendarDate.date === this.selectedEndDate) {
      return `${baseClasses} bg-blue-200 hover:bg-blue-300 cursor-pointer`;
    }
    return `${baseClasses} bg-gray-100 hover:bg-gray-200 cursor-pointer`;
  }

  selectDate(date: string): void {
    if (this.isSelectingStart) {
      this.selectedStartDate = date;
      this.selectionIndicator = 'Now select the start time';
    } else {
      if (!this.selectedStartDate) {
        this.selectionIndicator = 'Please select the start date first';
        alert("Select the start date first.");
        return;
      }
      this.selectedEndDate = date;
      this.selectionIndicator = 'Now select the end time';
    }
    this.isSelectingStart = !this.isSelectingStart;
    this.cdr.markForCheck();
  }

  validateTimeSelection(): boolean {
    if (!this.selectedStartTime || !this.selectedEndTime) return false;
    if (this.selectedStartTime === this.selectedEndTime) return false;
    const [sHour, sMin, sSec] = this.selectedStartTime.split(':').map(Number);
    const [eHour, eMin, eSec] = this.selectedEndTime.split(':').map(Number);
    const startSeconds = sHour * 3600 + sMin * 60 + sSec;
    const endSeconds = eHour * 3600 + eMin * 60 + eSec;
    return endSeconds > startSeconds;
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    this.calendarDates = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1).toISOString().split('T')[0];
      return { date, isBooked: this.bookedDates.includes(date) };
    });

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

  async makeReservation(): Promise<void> {
    if (!this.validateTimeSelection()) {
      alert("End time must be after the start time and cannot be the same.");
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
      localStorage.setItem('bookingData', JSON.stringify({
        ...response,
        timestamp: new Date().toISOString()
      }));
      this.router.navigate(['/payment-receipt']);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('There was an issue saving the reservation. Please try again.');
    }
  }

  nextStep(): void {
    if (this.selectedStartDate && this.selectedStartTime && this.selectedEndDate && this.selectedEndTime) {
      if (!this.validateTimeSelection()) {
        alert("End time must be after the start time.");
        return;
      }
      this.cdr.markForCheck();
    } else {
      alert('Please select date and time before proceeding.');
    }
  }
}
