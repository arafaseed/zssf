import { Component, OnInit } from '@angular/core';
import { Staff, StaffViewService } from '../Services/staff-view.service';
import { MatDialog } from '@angular/material/dialog';
import { StaffDialogComponent } from '../staff-dialog.component/staff-dialog.component';

@Component({
  selector: 'app-staff-table',
  templateUrl: './staff-table.component.html',
  standalone: false,
  styleUrls: ['./staff-table.component.css'],
})
export class StaffTableComponent implements OnInit {

  staffList: any[] = [];

  // ✅ renamed displayedColumns to match staff fields
  displayedColumns: string[] = [
    'staffIdentification',          // ✅ changed staffIdentification → staffId
    'fullName',
    'phoneNumber',
    'role',
    'venueName',
    'assignVenue',
    'actions',
    
  ];
  router: any;
venueList: any;

  constructor(
    private staffService: StaffViewService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadStaff();
    this.loadVenues();
  }

  /** Load all staff from API */
loadStaff(): void {
  this.staffService.getAllStaff().subscribe(staffList => {
    this.staffList = staffList;

    this.staffList.forEach(staff => {
      this.staffService.getAssignedVenues(staff.staffId).subscribe(venues => {
        // Show all assigned venues
        staff.assignedVenues = venues || [];
        staff.venueName = staff.assignedVenues.length
          ? staff.assignedVenues.map((v: { venueName: any; }) => v.venueName).join(', ')
          : 'Not Assigned';
      });
    });
  });
}


  /** Load all venues from API */
  loadVenues(): void {
    this.staffService.getAllVenues().subscribe({
      next: (data) => {
        this.venueList = data;
      },
      error: (err) => {
        console.error("❌ Error loading venues:", err);
      }
    });
  }

  /** Assign staff to a venue */
 onAssignVenue(staff: Staff, venueId: number): void {
  if (!venueId || !staff?.staffId) {
    console.error("❌ Missing staffId or venueId");
    return;
  }

  this.staffService.assignStaffToVenue(staff.staffId, venueId).subscribe({
    next: () => {
      alert(`✅ ${staff.fullName} assigned successfully`);
      this.loadStaff();   // 🔥 refresh staff list automatically
    },
    error: (err) => {
      console.error("❌ Error assigning staff to venue:", err);
      alert("❌ Failed to assign staff to venue");
    }
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
        error: (err) => {
          console.error('❌ Error deleting staff:', err);
        }
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
          // ✅ update staff
          this.staffService.updateStaff(staff.staffId, result).subscribe({
            next: () => {
              alert('✅ Staff updated successfully');
              this.loadStaff();
            },
            error: (err) => {
              console.error('❌ Error updating staff:', err);
            }
          });
        } else {
          // ✅ add staff
          this.staffService.addStaff(result).subscribe({
            next: () => {
              alert('✅ Staff added successfully');
              this.loadStaff();
            },
            error: (err: any) => {
              console.error('❌ Error adding staff:', err);
            }
          });
        }
      }
    });
  }
}
