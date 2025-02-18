import { Component } from '@angular/core';
interface CalendarDay {
  date: number;
  available: boolean;
}

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  standalone: false,
  styleUrls: ['./booking-form.component.css']
})
export class BookingFormComponent {
  // Booking model to store form data
  booking = {
    fullName: '',
    phoneNumber: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    venueId: null
  };

  venues = [
    { id: 1, name: 'Venue A' },
    { id: 2, name: 'Venue B' },
    { id: 3, name: 'Venue C' }
  ];

  calendarDays: CalendarDay[] = [];
  selectedStartDate: any = null;
  selectedEndDate: any = null;
  month: number = new Date().getMonth(); // current month
  year: number = new Date().getFullYear();
  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    const firstDayOfMonth = new Date(this.year, this.month, 1).getDay();
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
    this.calendarDays = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const day: CalendarDay = {
        date: i,
        available: i % 2 === 0 // Example: make every even date available
      };
      this.calendarDays.push(day);
    }
  }

  onDateSelect(day: CalendarDay) {
    if (day.available) {
      if (!this.selectedStartDate) {
        this.selectedStartDate = day;
        this.booking.startDate = `${this.year}-${this.month + 1}-${day.date}`;
      } else if (!this.selectedEndDate && day.date > this.selectedStartDate.date) {
        this.selectedEndDate = day;
        this.booking.endDate = `${this.year}-${this.month + 1}-${day.date}`;
      } else {
        this.selectedStartDate = day;
        this.selectedEndDate = null;
        this.booking.startDate = `${this.year}-${this.month + 1}-${day.date}`;
        this.booking.endDate = '';
      }
    }
  }

  isDateSelected(day: CalendarDay): boolean {
    return day === this.selectedStartDate || day === this.selectedEndDate;
  }

  changeMonth(direction: number) {
    this.month += direction;
    if (this.month > 11) {
      this.month = 0;
      this.year++;
    } else if (this.month < 0) {
      this.month = 11;
      this.year--;
    }
    this.generateCalendar();
  }

  submitForm() {
    if (this.booking.startDate && this.booking.endDate && this.booking.startTime && this.booking.endTime) {
      console.log('Booking Details:', this.booking);
      // Handle booking submission (e.g., API call)
    } else {
      console.log('Please fill all required fields.');
    }
  }
}