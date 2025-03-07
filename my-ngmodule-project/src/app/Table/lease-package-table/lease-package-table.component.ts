import { Component, OnInit } from '@angular/core';
import { LeasePackageService } from '../../packages.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-lease-package-table',
  templateUrl: './lease-package-table.component.html',
  standalone: false,
  styleUrls: ['./lease-package-table.component.css']
})
export class LeasePackageTableComponent implements OnInit {

  leasePackages: any[] = [];
  displayedColumns: string[] = ['description', 'price', 'actions']; 


  
  dataSource = [];

  

  constructor(private leasePackageService: LeasePackageService, private router: Router) { }

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
      this.leasePackageService.deleteLeasePackage(id).subscribe(response => {
        console.log(response); // Optional: Log the success message
        this.loadLeasePackages(); // Refresh the list
      }, error => {
        console.error('Error deleting lease package:', error);
      });
    }
  }
  
  navigateToEditForm(leaseId: number): void { 
    this.router.navigate(['/admin/leasepackageeditform', leaseId]);
  }
  

 

}