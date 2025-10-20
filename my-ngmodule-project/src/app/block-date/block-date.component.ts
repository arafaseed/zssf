import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

interface Venue {
  venueId: number;
  venueName: string;
}

@Component({
  selector: 'app-block-date',
  templateUrl: './block-date.component.html',
  standalone: false,
  styleUrls: ['./block-date.component.css']
})
export class BlockDateComponent implements OnInit {
  blockDateForm: FormGroup;
  blockedDates: Date[] = [];
  venues: Venue[] = [];
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.blockDateForm = this.fb.group({
      venueId: [null, Validators.required],
      date: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchVenues();
  }

  fetchVenues() {
    this.http.get<Venue[]>(`${environment.apiUrl}/api/bookings/list-available-venues?date=${new Date().toISOString().split('T')[0]}`)
      .subscribe({
        next: (res: any) => {
          // Assuming API returns {count: x, venues: [...]}
          this.venues = res.venues;
        },
        error: (err) => {
          this.snackBar.open('Failed to load venues', 'Close', { duration: 3000 });
        }
      });
  }

  blockDate() {
    if (this.blockDateForm.invalid) return;

    const selectedVenueId = this.blockDateForm.value.venueId;
    const selectedDate: Date = this.blockDateForm.value.date;
    const formattedDate = selectedDate.toISOString().split('T')[0]; // yyyy-MM-dd

    this.loading = true;
    this.http.post(`${environment.apiUrl}/api/bookings/venue/${selectedVenueId}/block-dates`, {
      dates: [formattedDate],
      reason: 'Blocked by admin'
    }).subscribe({
      next: (res: any) => {
        this.blockedDates.push(selectedDate);
        this.snackBar.open('Date blocked successfully', 'Close', { duration: 3000 });
        this.blockDateForm.patchValue({ date: null });
      },
      error: (err) => {
        this.snackBar.open(`Error blocking date: ${err.message || 'Server error'}`, 'Close', { duration: 4000 });
      },
      complete: () => this.loading = false
    });
  }

  unblockDate(date: Date) {
    this.blockedDates = this.blockedDates.filter(d => d.getTime() !== date.getTime());
    this.snackBar.open('Date unblocked locally', 'Close', { duration: 3000 });
  }
}
