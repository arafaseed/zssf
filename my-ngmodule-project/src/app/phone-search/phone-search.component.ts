import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-phone-search',
  templateUrl: './phone-search.component.html',
  standalone:false,
  styleUrls: ['./phone-search.component.css']
})
export class PhoneSearchComponent {
  phoneNumber: string = '';
  bookings: any[] = [];
  noResults = false;
  searching = false;

  constructor(private http: HttpClient) {}

  onSubmit() {
    if (!this.phoneNumber.trim()) return;
    
    this.searching = true;
    this.noResults = false;
    this.bookings = [];

    this.http.get<any[]>(`http://localhost:8080/api/bookings/view/by-phone/${this.phoneNumber}`)
      .subscribe({
        next: (data) => {
          this.bookings = data;
          this.noResults = data.length === 0;
          this.searching = false;
        },
        error: (err) => {
          this.noResults = true;
          this.searching = false;
          console.error('Error fetching bookings:', err);
        }
      });
  }
}
