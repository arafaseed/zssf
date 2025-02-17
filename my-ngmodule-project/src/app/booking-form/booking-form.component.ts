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
<<<<<<< HEAD
  standalone: false, 
=======
  imports: [FormsModule, CommonModule],
  standalone: true, // Use this if your project supports standalone components
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc
})
export class BookingFormComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar', { static: false }) calendarEl!: ElementRef;
  calendar: Calendar | null = null;
  booking: any = {};

  ngOnInit() {
<<<<<<< HEAD
=======
    // Initialize booking object
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc
    this.booking = {
      name: '',
      email: '',
      phone: '',
<<<<<<< HEAD
      Startdate: '',
      Enddate:'',
      Starttime: '',
      Endtime:''
=======
      date: '',
      time: ''
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc
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
<<<<<<< HEAD
    this.booking.date = info.dateStr; // Set selected date in form
  }

  submitForm() {
    console.log("Booking Data:", this.booking);
=======
    this.booking.date = info.dateStr; // Set selected date in the form
  }

  submitForm() {
    console.log("Booking data:", this.booking);
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc
    alert("Reservation submitted successfully!");
  }
}
