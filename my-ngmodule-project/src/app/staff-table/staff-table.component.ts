import { Component, OnInit } from '@angular/core';
import { StaffViewService } from '../Services/staff-view.service';
import { MatDialog } from '@angular/material/dialog';
import { StaffDialogComponent } from '../staff-dialog.component/staff-dialog.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-staff-table',
  templateUrl: './staff-table.component.html',
  standalone: false,
  styleUrls: ['./staff-table.component.css'],
})
export class StaffTableComponent implements OnInit {

  staffList: any[] = [];
  displayedColumns: string[] = [
    'staffIdentification',
    'fullName',
    'phoneNumber',
    'role',
    'assignedVenue',  // ✅ new column for venue
    'actions'
  ];

  constructor(
    private staffService: StaffViewService,
    private dialog: MatDialog,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  /** Load all staff and their assigned venues */
  loadStaff(): void {
    this.staffService.getAllStaff().subscribe({
      next: (data) => {
        this.staffList = data;

        // Fetch venue info for each staff
        this.staffList.forEach(staff => {
          if (staff.assignedVenueIds?.length) {
            this.http.get<any>(`http://localhost:8080/api/venues/${staff.assignedVenueIds[0]}`)
              .subscribe({
                next: venue => staff.assignedVenueName = venue.venueName,
                error: () => staff.assignedVenueName = 'Unknown'
              });
          } else {
            staff.assignedVenueName = null;
          }
        });
      },
      error: (err) => console.error('❌ Error loading staff:', err)
    });
  }

  /** Delete staff */
  deleteStaff(staffId: number): void {
    if (confirm('Are you sure you want to delete this staff?')) {
      this.staffService.deleteStaff(staffId).subscribe({
        next: () => {
          alert('✅ Staff deleted successfully');
          this.loadStaff();
        },
        error: (err) => console.error('❌ Error deleting staff:', err)
      });
    }
  }

  /** Open dialog for Add / Edit */
  openAddStaffDialog(staff?: any): void {
    const dialogRef = this.dialog.open(StaffDialogComponent, {
      width: '450px',
      data: staff ? { ...staff } : null
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (staff) {
          // Update staff
          this.staffService.updateStaff(staff.staffId, result).subscribe({
            next: () => {
              alert('✅ Staff updated successfully');
              this.loadStaff();
            },
            error: (err) => console.error('❌ Error updating staff:', err)
          });
        } else {
          // Add staff
          this.staffService.addStaff(result).subscribe({
            next: () => {
              alert('✅ Staff added successfully');
              this.loadStaff();
            },
            error: (err: any) => console.error('❌ Error adding staff:', err)
          });
        }
      }
    });
  }
}
