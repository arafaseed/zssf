import { Component } from '@angular/core';

@Component({
  selector: 'app-reservation',
  standalone: false,
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css'
})
export class ReservationComponent {
   // Placeholder data for available booking options
   availableDates: string[] = ['2025-02-20', '2025-02-21', '2025-02-22'];
   availableTimes: string[] = ['09:00 AM', '12:00 PM', '03:00 PM'];
   
   selectedDate: string = '';
   selectedTime: string = '';
   numberOfGuests: number = 1;
   
   // Placeholder for form submission
   bookingDetails: any = {};
 
   constructor() { }
 
   // Function to submit the booking
   submitBooking() {
     this.bookingDetails = {
       date: this.selectedDate,
       time: this.selectedTime,
       guests: this.numberOfGuests
     };
     alert('Booking confirmed for ' + this.selectedDate + ' at ' + this.selectedTime);
   }
 }
