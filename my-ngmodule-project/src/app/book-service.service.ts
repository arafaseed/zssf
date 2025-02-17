import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class BookServiceService {selectedVenue: any = null; // Store selected venue here

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get the venue ID from the route parameters (if required)
    const venueId = this.route.snapshot.paramMap.get('id');
    console.log('Selected Venue ID:', venueId);
  }

  // Example method to handle booking (you should implement the API call here)
  bookVenue(bookingDetails: any) {
    // Simulate a booking request (you can replace it with an actual API call)
    return {
      success: true,
      message: 'Booking successful!'
    };
  }
}