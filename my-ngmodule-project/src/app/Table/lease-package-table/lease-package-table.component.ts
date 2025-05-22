import { Component, OnInit } from '@angular/core';
import { LeasePackageService } from '../../Services/packages.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LeasePackageEditFormComponent } from '../../Form/lease-package-edit-form/lease-package-edit-form.component';

@Component({
  selector: 'app-lease-package-table',
  standalone: false,
  templateUrl: './lease-package-table.component.html',
  styleUrls: ['./lease-package-table.component.css']
})
export class LeasePackageTableComponent implements OnInit {

  leasePackages: any[] = [];
  displayedColumns: string[] = ['packageName', 'description', 'price', 'actions']; // Updated

  constructor(
    private leasePackageService: LeasePackageService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadLeasePackages();
  }

  loadLeasePackages() {
    this.leasePackageService.getAllLeasePackages().subscribe(data => {
      console.log('Lease packages loaded:', data);
      this.leasePackages = data;
    });
  }

  deleteLeasePackage(id: number): void {
    const confirmDelete = window.confirm('Are you sure you want to delete this lease package?');

    if (confirmDelete) {
      this.leasePackageService.deleteLeasePackage(id).subscribe(response => {
        console.log('Deleted lease package:', response);
        this.loadLeasePackages();
      }, error => {
        console.error('Error deleting lease package:', error);
      });
    }
  }

  openEditModal(leaseId: number): void {
    const dialogRef = this.dialog.open(LeasePackageEditFormComponent, {
      width: '500px',
      data: { leaseId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadLeasePackages();
      }
    });
  }
}
