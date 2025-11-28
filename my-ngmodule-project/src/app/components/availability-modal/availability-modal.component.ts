import { Component, Inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { takeUntil } from 'rxjs/operators';
import { Subject, interval } from 'rxjs';

@Component({
  selector: 'app-availability-modal',
  standalone: false,
  templateUrl: './availability-modal.component.html',
})
export class AvailabilityModalComponent implements OnInit, OnDestroy{
  private destroy$ = new Subject<void>();
  loading = true;
  availability: any[] = [];
  errorMsg = '';
  allAvailable = false;

  // whether we should auto-check AVAILABLE_FOR_BOOKING items
  autoCheckEnabled = false;

  // track selected items (objects from availability)
  selectedItems: any[] = [];

  @ViewChild('selectionList') selectionList?: MatSelectionList;
it: any;

  // data expected: { venueId, venueName, start (Date), end (Date), startTime, endTime, activityId, activityName }
  constructor(
    public ref: MatDialogRef<AvailabilityModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.check(); // initial load

  // auto refresh every 2 seconds
 
  }
  ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
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
    startTime: (this.data.startTime ?? ''),
    endTime: (this.data.endTime ?? '')
  };

  this.loading = true;
  this.http.post<any[]>(`${environment.apiUrl}/api/bookings/venue/${this.data.venueId}/availability`, payload).subscribe({
    next: res => {
      this.loading = false;

      // sort by date ascending
      this.availability = (res || []).slice().sort((a, b) => {
        const ta = new Date(a.date).getTime();
        const tb = new Date(b.date).getTime();
        return ta - tb;
      });

      // ✅ check if venue is blocked
      const isVenueBlocked = this.availability.length > 0 &&
        this.availability.every(it => it.flag === 'BLOCKED');

      if (isVenueBlocked) {
        this.errorMsg = 'This venue is temporarily blocked and cannot be booked at the moment.';
        this.allAvailable = false;
        this.selectedItems = [];
        return; // stop here, no selection needed
      }

      // compute allAvailable
      this.allAvailable = this.availability.length > 0 &&
        this.availability.every(it => it.flag === 'AVAILABLE_FOR_BOOKING' || it.flag === 'ALREADY_BOOKED');
        

      // compute autoCheckEnabled
      const hasBookedOrPending = this.availability.some(it =>
        it.flag === 'ALREADY_BOOKED' || Boolean(it.pendingExpiresInMinutes)
      );
      this.autoCheckEnabled = !hasBookedOrPending;

      // set selectedItems
      if (this.autoCheckEnabled) {
        this.selectedItems = this.availability.filter(it => it.flag === 'AVAILABLE_FOR_BOOKING');
      } else {
        this.selectedItems = [];
      }

      // sync selection with UI
      try {
        if (this.selectionList) {
          this.selectionList.deselectAll();
          if (this.selectedItems.length) {
            const opts = this.selectionList.options.toArray();
            opts.forEach(opt => {
              const val = opt.value as any;
              const shouldSelect = this.selectedItems.some(si => si.date === val.date);
              if (shouldSelect) opt.selected = true;
            });
          }
        }
      } catch (e) {
        console.warn('selection sync failed', e);
      }
    },
    error: err => {
      this.loading = false;
      this.errorMsg = 'Availability check failed. Please try again.';
      console.error('availability error', err);
    }
  });
}


  // Called by mat-selection-list (selectionChange)
  onSelectionChange(event: MatSelectionListChange) {
    const selected = event.source.selectedOptions.selected.map((opt: any) => opt.value);
    this.selectedItems = selected || [];
    // Note: isContinueEnabled getter will reflect the updated selectedItems
  }

  // single-item shortcut (keeps your old API; you can still call selectItem to return a single day)
  selectItem(item: any) {
    // return selected single day to caller
    this.ref.close({
      mode: 'single',
      item
    });
  }

  // Helper: indices of selected items within the current availability array (sorted)
  private getSelectedIndices(): number[] {
    if (!this.selectedItems || this.selectedItems.length === 0) return [];
    const indices: number[] = [];
    for (const s of this.selectedItems) {
      const idx = this.availability.findIndex(a => a.date === s.date);
      if (idx >= 0) indices.push(idx);
    }
    return indices.sort((a, b) => a - b);
  }

  // Helper: returns true if selected indices form a contiguous block (no gaps)
  private selectedIndicesContiguous(): boolean {
    const indices = this.getSelectedIndices();
    if (indices.length === 0) return false;
    const min = indices[0];
    const max = indices[indices.length - 1];
    // contiguous if number of indices equals the span length
    return (max - min + 1) === indices.length;
  }

  // continue enabled if either everything is available, or user selected a contiguous block of available days
 get isContinueEnabled(): boolean {
  // Allow continue only if there are selected items AND
  // all of them are AVAILABLE_FOR_BOOKING.
  if (!this.selectedItems || this.selectedItems.length === 0) return false;

  // Ensure every selected slot is actually available for booking
  const allSelectedAvailable = this.selectedItems.every(
    it => it.flag === 'AVAILABLE_FOR_BOOKING'
  );
  if (!allSelectedAvailable) return false;

  // Make sure selected items are contiguous (no gaps)
  if (!this.selectedIndicesContiguous()) return false;

  return true;
}


  continueWithRange() {
    // user explicitly chooses to continue with full range (only enable if allAvailable or valid selection)
    if (this.allAvailable) {
      this.ref.close({
        mode: 'range',
        start: this.data.start,
        end: this.data.end,
        startTime: this.data.startTime,
        endTime: this.data.endTime,
        activityId: this.data.activityId,
        activityName: this.data.activityName,
        activityPrice: this.data.price
      });
      return;
    }

    // if manual selection is used, ensure it's valid and build new start/end from selected days
    if (!this.selectedItems || this.selectedItems.length === 0) return;
    if (!this.isContinueEnabled) return; // safety

    // compute new start and end dates from selected items (they are contiguous by isContinueEnabled)
    const selectedDates = this.selectedItems
      .map(it => new Date(it.date))
      .sort((a, b) => a.getTime() - b.getTime());

    const newStart = selectedDates[0];
    const newEnd = selectedDates[selectedDates.length - 1];

    this.ref.close({
      mode: 'range',
      start: newStart,
      end: newEnd,
      startTime: this.data.startTime,
      endTime: this.data.endTime,
      activityId: this.data.activityId,
      activityName: this.data.activityName,
      activityPrice: this.data.price,
      selectedDays: this.selectedItems
    });
  }

  cancel() {
    this.ref.close(null);
  }
}
