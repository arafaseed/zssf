import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.component.html',
  styleUrls: ['./booking-form.component.css'],
  imports: [FormsModule, CommonModule],
  standalone: true, // Use this if your project supports standalone components
})
export class BookingFormComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar', { static: false }) calendarEl!: ElementRef;
  calendar: Calendar | null = null;
  booking: any = {};

  ngOnInit() {
    // Initialize booking object
    this.booking = {
      name: '',
      email: '',
      phone: '',
      date: '',
      time: ''
    };
  }

  ngAfterViewInit() {
    if (this.calendarEl?.nativeElement) {
      this.calendar = new Calendar(this.calendarEl.nativeElement, {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        selectable: true,
        dateClick: this.handleDateClick.bind(this),
      });
      this.calendar.render();
    } else {
      console.error("Calendar element not found!");
    }
  }

  handleDateClick(info: any) {
    this.booking.date = info.dateStr; // Set selected date in the form
  }

  submitForm() {
    console.log("Booking data:", this.booking);
    alert("Reservation submitted successfully!");
  }
}
