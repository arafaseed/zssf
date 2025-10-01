import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatSelectionListChange, MatSelectionList } from '@angular/material/list';

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

  // track selected items (objects from availability)
  selectedItems: any[] = [];

  @ViewChild('selectionList') selectionList?: MatSelectionList;

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
      startTime: (this.data.startTime ?? ''),
      endTime: (this.data.endTime ?? '')
    };

    this.loading = true;
    // Use absolute backend URL (keeps your original logic)
    this.http.post<any[]>(`${environment.apiUrl}/api/bookings/venue/${this.data.venueId}/availability`, payload).subscribe({
      next: res => {
        this.loading = false;
        // ensure availability sorted by date ascending so index-based contiguous checks are stable
        this.availability = (res || []).slice().sort((a, b) => {
          const ta = new Date(a.date).getTime();
          const tb = new Date(b.date).getTime();
          return ta - tb;
        });

        // clear any previous selection because list changed
        this.clearSelectionState();

        this.allAvailable = this.availability.length > 0 && this.availability.every(it => it.flag === 'AVAILABLE_FOR_BOOKING');
      },
      error: err => {
        this.loading = false;
        this.errorMsg = 'Availability check failed. Please try again.';
        console.error('availability error', err);
      }
    });
  }

  // clear selection tracking and UI selection
  private clearSelectionState() {
    this.selectedItems = [];
    // clear mat-selection-list UI if available
    try {
      if (this.selectionList) {
        this.selectionList.deselectAll();
      }
    } catch (e) { /* ignore if not present yet */ }
  }

  // Called by mat-selection-list (selectionChange)
  onSelectionChange(event: MatSelectionListChange) {
    // extract selected values (we set [value]="it" on mat-list-option)
    const selected = event.source.selectedOptions.selected.map((opt: any) => opt.value);
    this.selectedItems = selected || [];
    // Note: isContinueEnabled is a getter used by template
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
    if (this.allAvailable) return true;

    if (!this.selectedItems || this.selectedItems.length === 0) return false;

    // every selected must be AVAILABLE_FOR_BOOKING
    const allSelectedAvailable = this.selectedItems.every(it => it.flag === 'AVAILABLE_FOR_BOOKING');
    if (!allSelectedAvailable) return false;

    // selected items must form a contiguous block with no skipped days between them
    if (!this.selectedIndicesContiguous()) return false;

    // passed all checks
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
      // return Date objects as the original code used, keep consistency
      start: newStart,
      end: newEnd,
      startTime: this.data.startTime,
      endTime: this.data.endTime,
      activityId: this.data.activityId,
      activityName: this.data.activityName,
      activityPrice: this.data.price,
      // also include selectedDays if caller wants the day-by-day objects
      selectedDays: this.selectedItems
    });
  }

  cancel() {
    this.ref.close(null);
  }
}
