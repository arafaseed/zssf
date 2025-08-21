import { Component, OnInit } from '@angular/core';
import { StaffViewService } from '../Services/staff-view.service';
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
    'actions'
  ];
  router: any;

  constructor(
    private staffService: StaffViewService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadStaff();
  }

  /** Load all staff from service */
  loadStaff(): void {
    this.staffService.getAllStaff().subscribe({
      next: (data) => {
        this.staffList = data;
      },
      error: (err) => {
        console.error('❌ Error loading staff:', err);
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
