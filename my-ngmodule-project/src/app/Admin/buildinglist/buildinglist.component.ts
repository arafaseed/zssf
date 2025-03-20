import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BuildinglistService } from '../../Services/buildinglist.service';
import { HttpClient } from '@angular/common/http';  // Import HttpClient

@Component({
  selector: 'app-buildinglist',
  standalone: false,
  templateUrl: './buildinglist.component.html',
  styleUrl: './buildinglist.component.css'
})
export class BuildinglistComponent implements OnInit {
  buildings: any[] = [];
  buildingForm: FormGroup;
  showPopup: boolean = false;
  http: any;

  constructor(
    private buildingService: BuildinglistService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private httpClient: HttpClient  // Inject HttpClient here
  ) {
    this.buildingForm = this.fb.group({
      buildingName: ['', Validators.required],
      address: ['', Validators.required],
    });
  }
  loadLeasePackages() {
    this.buildingService.getBuildings().subscribe((data: any[]) => {
      this.buildings = data;
    });
  }

  ngOnInit(): void {
    this.loadLeasePackages();
  }

  // Fetch all buildings from API
  // getBuildings(): void {
  //   this.buildingService.getBuildings().subscribe((data: any[]) => {
  //     this.buildings = data;
  //   });
  // }

  // Open the popup form
  openPopup(): void {
    this.showPopup = true;
  }

  // Close the popup form
  closePopup(): void {
    this.showPopup = false;
    this.buildingForm.reset();
  }

  // Add a new building
  addBuilding(): void {
    if (this.buildingForm.valid) {
      this.buildingService.addBuilding(this.buildingForm.value).subscribe(
        () => {
          this.snackBar.open('Building added successfully!', 'Close', { duration: 3000 });
          this.loadLeasePackages(); // Refresh the list
          this.closePopup();
        },
        () => {
          this.snackBar.open('Failed to add building!', 'Close', { duration: 3000 });
        }
      );
    }
  }

  // Delete a building
  deleteLeasePackage(id: number): void {
    const confirmDelete = window.confirm('Are you sure you want to delete this building?');
    
    if (confirmDelete) {
      this.buildingService.deleteBuilding(id).subscribe(() => {
        this.loadLeasePackages();
      });
    }

  //   // Use HttpClient for the API call
  //   this.httpClient.delete(`http://localhost:8080/api/buildings/delete/${id}`)
  //     .subscribe({
  //       next: () => {
  //         console.log("Building deleted successfully");
  //         //  // Refresh list
  //         this.snackBar.open('Building deleted successfully!', 'Close', { duration: 3000 });
  //       },
  //       error: (error: any) => {
  //         console.error("Error deleting building:", error);
  //         this.snackBar.open('Failed to delete building!', 'Close', { duration: 3000 });
  //       }
  //     });
  // }
  
  
}
}