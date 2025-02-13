import { Component, OnInit } from '@angular/core';
import { LeasePackageService } from '../../packages.service';


@Component({
  selector: 'app-lease-package-table',
  templateUrl: './lease-package-table.component.html',
  standalone: false,
  styleUrls: ['./lease-package-table.component.css']
})
export class LeasePackageTableComponent implements OnInit {

  leasePackages: any[] = [];
  displayedColumns: string[] = ['leaseId', 'category', 'price', 'actions']; 
  
  dataSource = [];
  

  constructor(private leasePackageService: LeasePackageService) { }

  ngOnInit(): void {
    this.loadLeasePackages();
  }

  loadLeasePackages() {
    this.leasePackageService.getAllLeasePackages().subscribe(data => {
      this.leasePackages = data;
    });
  }
  openAddModal(): void {
    // Logic to open the modal for adding a lease package
    console.log('Open Add Modal');
  }

  deleteLeasePackage(id: number) {
    this.leasePackageService.deleteLeasePackage(id).subscribe(() => {
      this.loadLeasePackages();
    });
  }

  editLeasePackage(leasePackage: any) {
    // Logic for editing the lease package
  }
}