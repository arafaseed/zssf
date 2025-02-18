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
  router: any;
  

  constructor(private leasePackageService: LeasePackageService) { }

  ngOnInit(): void {
    this.loadLeasePackages();
  }

  loadLeasePackages() {
    this.leasePackageService.getAllLeasePackages().subscribe(data => {
      this.leasePackages = data;
    });
  }
  

  deleteLeasePackage(id: number): void {
    const confirmDelete = window.confirm('Are you sure you want to delete this lease package?');
    
    if (confirmDelete) {
      this.leasePackageService.deleteLeasePackage(id).subscribe(() => {
        this.loadLeasePackages();
      });
    }
  }
  

  editLeasePackage(id: number): void {
    this.router.navigate(['/edit-lease-package', id]);
  }
}