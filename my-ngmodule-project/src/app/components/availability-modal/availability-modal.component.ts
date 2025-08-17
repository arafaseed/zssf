import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-availability-modal',
  standalone: false,
  templateUrl: './availability-modal.component.html',
})
export class AvailabilityModalComponent implements OnInit {
  loading = true;
  availability: any[] = [];
  errorMsg = '';
  allAvailable = false;

  // data expected: { venueId, venueName, start (Date), end (Date), startTime, endTime, activityId, activityName }
  constructor(
    public ref: MatDialogRef<AvailabilityModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.check();
  }

  private formatDate(d: Date | string | null) {
    if (!d) return null;
    const date = new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  check() {
    if (!this.data?.venueId) {
      this.errorMsg = 'Missing venue id';
      this.loading = false;
      return;
    }

    const payload = {
      startDate: this.formatDate(this.data.start),
      endDate: this.formatDate(this.data.end),
      startTime: (this.data.startTime ?? '07:00'),
      endTime: (this.data.endTime ?? '23:59')
    };

    this.loading = true;
    // Use absolute backend URL (keeps your original logic)
    this.http.post<any[]>(`http://localhost:8080/api/bookings/venue/${this.data.venueId}/availability`, payload).subscribe({
      next: res => {
        this.loading = false;
        this.availability = res || [];
        this.allAvailable = this.availability.length > 0 && this.availability.every(it => it.flag === 'AVAILABLE_FOR_BOOKING');
        // NOTE: do not auto-close. We want the user to choose manually even if allAvailable.
      },
      error: err => {
        this.loading = false;
        this.errorMsg = 'Availability check failed. Please try again.';
        console.error('availability error', err);
      }
    });
  }

  // user selects a single date item (an object returned by API)
  selectItem(item: any) {
    // return selected single day to caller
    this.ref.close({
      mode: 'single',
      item
    });
  }

  continueWithRange() {
    // user explicitly chooses to continue with full range (only enable if allAvailable)
    if (!this.allAvailable) return;
    this.ref.close({
      mode: 'range',
      start: this.data.start,
      end: this.data.end,
      startTime: this.data.startTime,
      endTime: this.data.endTime,
      activityId: this.data.activityId,
      activityName: this.data.activityName
    });
  }

  cancel() {
    this.ref.close(null);
  }
}
