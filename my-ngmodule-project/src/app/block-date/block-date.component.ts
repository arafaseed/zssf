import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

interface Venue {
  venueId: number;
  venueName: string;
}

interface BlockedDate {
  id: number;
  blockedDate: string; // ISO string
}

@Component({
  selector: 'app-block-date',
  templateUrl: './block-date.component.html',
  standalone: false,
  styleUrls: ['./block-date.component.css']
})
export class BlockDateComponent implements OnInit {
  blockDateForm: FormGroup;
  venues: Venue[] = [];
  blockedDates: BlockedDate[] = [];
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

    // Reload blocked dates when venue changes
    this.blockDateForm.get('venueId')?.valueChanges.subscribe(venueId => {
      if (venueId) {
        this.fetchBlockedDates(venueId);
      } else {
        this.blockedDates = [];
      }
    });
  }

  // Fetch all venues
  fetchVenues() {
    this.http.get<Venue[]>(`${environment.apiUrl}/api/venues/view/all`)
      .subscribe({
        next: res => this.venues = res || [],
        error: () => this.snackBar.open('Failed to load venues', 'Close', { duration: 3000 })
      });
  }

  // Fetch blocked dates for selected venue
  fetchBlockedDates(venueId: number) {
    this.loadingBlockedDates = true;
    this.http.get<BlockedDate[]>(`${environment.apiUrl}/api/bookings/${venueId}/blocked-dates`)
      .subscribe({
        next: res => this.blockedDates = res || [],
        error: () => {
          this.blockedDates = [];
          this.snackBar.open('Failed to load blocked dates', 'Close', { duration: 3000 });
        },
        complete: () => this.loadingBlockedDates = false
      });
  }

  // Block a new date
  blockDate() {
    if (this.blockDateForm.invalid) return;

    const venueId = this.blockDateForm.value.venueId;
    const selectedDate: Date = this.blockDateForm.value.date;
    const formattedDate = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD

    // ✅ Check if date is already blocked
    const alreadyBlocked = this.blockedDates.some(d => d.blockedDate === formattedDate);
    if (alreadyBlocked) {
      this.snackBar.open('This date is already blocked for the selected venue!', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    this.http.post<BlockedDate[]>(`${environment.apiUrl}/api/bookings/venue/${venueId}/block-dates`, {
      dates: [formattedDate]
    }).subscribe({
      next: res => {
        // Add newly blocked date(s) with IDs returned from backend
        this.blockedDates.push(...res);
        this.snackBar.open('Date blocked successfully!', 'Close', { duration: 3000 });
        this.blockDateForm.patchValue({ date: null });
      },
      error: (err) => this.snackBar.open(`Error blocking date: ${err.error?.message || 'Server error'}`, 'Close', { duration: 4000 }),
      complete: () => this.loading = false
    });
  }

  // Delete a blocked date
  unblockDate(blocked: BlockedDate) {
    if (!blocked.id) return;

    this.http.delete(`${environment.apiUrl}/api/bookings/blocked-dates/${blocked.id}`)
      .subscribe({
        next: () => {
          this.blockedDates = this.blockedDates.filter(d => d.id !== blocked.id);
          this.snackBar.open('Blocked date deleted successfully!', 'Close', { duration: 3000 });
        },
        error: (err) => this.snackBar.open(`Failed to delete blocked date: ${err.error?.message || 'Server error'}`, 'Close', { duration: 4000 })
      });
  }
}
