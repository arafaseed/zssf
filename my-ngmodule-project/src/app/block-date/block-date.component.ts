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
  venueName: string;
  blockedDate: string;
  reason: string;
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
  today: Date = new Date();

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
      next: res => {
        this.blockedDates = res || [];
        // Automatically remove past dates from DB
        this.deletePastBlockedDates(venueId);
      },
      error: () => {
        this.blockedDates = [];
        this.snackBar.open('Failed to load blocked dates', 'Close', { duration: 3000 });
      },
      complete: () => this.loadingBlockedDates = false
    });
}


  // ✅ Block a new date (auto-refresh after success)
 blockDate() {
  if (this.blockDateForm.invalid) return;

  const venueId = this.blockDateForm.value.venueId;
  const selectedDate: Date = this.blockDateForm.value.date;
  const formattedDate = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD

  // Prevent duplicate block
  const alreadyBlocked = this.blockedDates.some(d => d.blockedDate === formattedDate);
  if (alreadyBlocked) {
    this.snackBar.open('This date is already blocked for this venue!', 'Close', { duration: 2500 });
    return;
  }

  this.loading = true;

  this.http.post(`${environment.apiUrl}/api/bookings/venue/${venueId}/block-dates`, {
    dates: [formattedDate]
  }).subscribe({
    next: () => {
      this.snackBar.open('Date blocked successfully!', 'Close', { duration: 2500 });

      // ✅ Refresh list after success
      this.fetchBlockedDates(venueId);

      // Reset date field
      this.blockDateForm.patchValue({ date: null });
    },
    error: (err) => {
      // ✅ Always stop loading even on error
      this.loading = false;

      // ✅ Shorter and safer message
      const msg = err?.error?.message || 'Failed to block date. Try again.';
      this.snackBar.open(msg, 'Close', { duration: 3000 });
    },
    complete: () => {
      // ✅ Ensure loading resets even if no error triggered
      this.loading = false;
    }
  });
}

deletePastBlockedDates(venueId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // compare only the date part

  this.blockedDates.forEach(date => {
    const blockedDate = new Date(date.blockedDate);
    blockedDate.setHours(0, 0, 0, 0);

    if (blockedDate < today) {
      this.unblockDate(date); // uses your existing delete API
    }
  });
}

  // ✅ Unblock date (auto-refresh after delete)
  unblockDate(blocked: BlockedDate) {
    if (!blocked.id) return;

    const venueId = this.blockDateForm.value.venueId;

    this.http.delete(`${environment.apiUrl}/api/bookings/blocked-dates/${blocked.id}`, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.snackBar.open('Blocked date deleted successfully!', 'Close', { duration: 3000 });
          // ✅ Auto-refresh after delete
          this.fetchBlockedDates(venueId);
        },
        error: (err) => {
          this.snackBar.open(`Failed to delete blocked date: ${err.error?.message || 'Server error'}`, 'Close', { duration: 4000 });
        }
      });
  }
  dateFilter = (d: Date | null): boolean => {
  if (!d) return false;
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today; // only allow today or future
};
}
