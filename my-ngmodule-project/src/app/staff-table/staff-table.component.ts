import { Component, OnInit } from '@angular/core';
import { StaffViewService } from '../Services/staff-view.service';
import { MatDialog } from '@angular/material/dialog';
import { StaffDialogComponent } from '../staff-dialog.component/staff-dialog.component.component';

@Component({
  selector: 'app-staff-table',
  templateUrl: './staff-table.component.html',
  standalone: false,
  styleUrls: ['./staff-table.component.css']
})
export class StaffTable implements OnInit {
  staffList: any[] = [];

  // 🔹 Fix: Declare displayedColumns for Angular Material Table
  displayedColumns: string[] = [
    'staffIdentification',
    'fullName',
    'phoneNumber',
    'role',
    'actions'
  ];

  constructor(
    private staffService: StaffViewService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  /** Load staff list */
  loadStaff(): void {
    this.staffService.getAllStaff().subscribe({
      next: (data) => {
        this.staffList = data;
      },
      error: (err) => {
        console.error('Error loading staff:', err);
      }
    });
  }

  /** Delete staff */
  deleteStaff(staffId: number): void {
    if (confirm('Are you sure you want to delete this staff?')) {
      this.staffService.deleteStaff(staffId).subscribe({
        next: () => {
          alert('Staff deleted successfully');
          this.loadStaff();
        },
        error: (err) => {
          console.error('Error deleting staff:', err);
        }
      });
    }
  }

  /** Add/Edit staff via dialog */
  openAddStaffDialog(staff?: any): void {
    const dialogRef = this.dialog.open(StaffDialogComponent, {
      width: '450px',
      data: staff ? { ...staff } : null
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (staff) {
          this.staffService.updateStaff(staff.staffId, result).subscribe({
            next: () => {
              alert('Staff updated successfully');
              this.loadStaff();
            },
            error: (err) => {
              console.error('Error updating staff:', err);
            }
          });
        
        }
      }
    });
  }
}
