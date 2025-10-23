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
  blockedDates: string[] = [];
  venues: Venue[] = [];
  loading = false;
  loadingBlockedDates = false;

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

    // Whenever venue changes, reload its blocked dates
    this.blockDateForm.get('venueId')?.valueChanges.subscribe(venueId => {
      if (venueId) {
        this.fetchBlockedDates(venueId);
      } else {
        this.blockedDates = [];
      }
    });
  }

  // ✅ Fetch available venues
 fetchVenues() {
  this.http.get<any>(`${environment.apiUrl}/api/venues/view/all`)
    .subscribe({
      next: (res) => {
        this.venues = res || [];
      },
      error: () => {
        this.snackBar.open('Failed to load venues', 'Close', { duration: 3000 });
      }
    });
}


  // ✅ Fetch blocked dates for a venue
  fetchBlockedDates(venueId: number) {
    this.loadingBlockedDates = true;
    this.http.get<any>(`${environment.apiUrl}/api/bookings/venue/${venueId}/blocked-dates`)
      .subscribe({
        next: (res) => {
          // expect res to be like: { blockedDates: ["2025-10-20", "2025-10-21"] }
          this.blockedDates = res.blockedDates || [];
        },
        error: () => {
          this.blockedDates = [];
          this.snackBar.open('Failed to load blocked dates', 'Close', { duration: 3000 });
        },
        complete: () => this.loadingBlockedDates = false
      });
  }

  // ✅ Block selected date for venue (fixed timezone issue)
  blockDate() {
    if (this.blockDateForm.invalid) return;

    const venueId = this.blockDateForm.value.venueId;
    const selectedDate: Date = this.blockDateForm.value.date;

    // 🕒 FIX: prevent timezone shift
    const formattedDate = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD (local)

    this.loading = true;

    this.http.post(`${environment.apiUrl}/api/bookings/venue/${venueId}/block-dates`, {
      dates: [formattedDate],
      reason: 'Blocked by admin'
    }).subscribe({
      next: () => {
        this.blockedDates.push(formattedDate);
        this.snackBar.open('Date blocked successfully!', 'Close', { duration: 3000 });
        this.blockDateForm.patchValue({ date: null });
      },
      error: (err) => {
        this.snackBar.open(`Error blocking date: ${err.error?.message || 'Server error'}`, 'Close', { duration: 4000 });
      },
      complete: () => this.loading = false
    });
  }

  // ✅ Unblock locally only
  unblockDate(date: string) {
    this.blockedDates = this.blockedDates.filter(d => d !== date);
    this.snackBar.open('Date unblocked', 'Close', { duration: 3000 });
  }
}
