import { Component } from '@angular/core';

@Component({
  selector: 'app-venue',
  templateUrl: './venue.component.html',
  standalone: false,
  styleUrls: ['./venue.component.css']
})
export class VenueComponent {
  venues = [
    {
      title: 'Banquet Hall A',
      description: 'A spacious hall for events and gatherings.',
      image: [
        '/latylogo.png',
        '/latylogo.png',
        '/latylogo.png',
        '/latylogo.png'
      ]
    },
    {
      title: 'Conference Room B',
      description: 'Ideal for corporate meetings and conferences.',
      image: [
        '/latylogo.png',
        '/latylogo.png',
        '/latylogo.png',
        '/latylogo.png'
      ]
    },
    {
      title: 'Wedding Venue C',
      description: 'A beautiful venue for weddings and receptions.',
      image: [
        '/latylogo.png',
        '/latylogo.png',
        '/latylogo.png',
        '/latylogo.png'
      ]
    },
    {
      title: 'Garden Event Space',
      description: 'A scenic outdoor venue for events.',
      image: [
        '/latylogo.png',
        '/latylogo.png',
        '/latylogo.png',
        '/latylogo.png'
      ]
    },
    {
      title: 'Luxury Ballroom',
      description: 'A premium venue for high-end events.',
      image: [
        'assets/venue5-main.jpg', 
        '/latylogo.png',
        '/latylogo.png',
        '/latylogo.png',
        '/latylogo.png'
      ]
    },
    {
      title: 'Cozy Meeting Space',
      description: 'Perfect for small gatherings and discussions.',
      image: [
        '/latylogo.png',
        '/latylogo.png',
        '/latylogo.png',
        '/latylogo.png'
      ]
    }
  ];

  openDetails(venue: any) {
    alert(`Opening details for ${venue.title}`);
  }

  makeReservation() {
    alert('Reservation process started');
  }
}
