import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { OptionalServiceEditFormComponent } from '../../Form/optional-service-edit-form/optional-service-edit-form.component';
import { OptionalServiceService } from '../../Services/optional.service';

@Component({
  selector: 'app-optional-service-table',
  templateUrl: './optional-service-table.component.html',
  standalone:false,
  styleUrls: ['./optional-service-table.component.css']
})
export class OptionalServiceTableComponent implements OnInit {

  optionalServices: any[] = [];
  displayedColumns: string[] = ['serviceName', 'description', 'price', 'actions'];

  constructor(
    private optionalServiceService: OptionalServiceService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadOptionalServices();
  }

  loadOptionalServices() {
    this.optionalServiceService.getAllOptionalServices().subscribe(data => {
      console.log('Optional services loaded:', data);
      this.optionalServices = data;
    });
  }

  deleteOptionalService(id: number): void {
    const confirmDelete = window.confirm('Are you sure you want to delete this service?');

    if (confirmDelete) {
      this.optionalServiceService.deleteOptionalService(id).subscribe(response => {
        console.log('Deleted optional service:', response);
        this.loadOptionalServices();
      }, error => {
        console.error('Error deleting optional service:', error);
      });
    }
  }

  openEditModal(serviceId: number): void {
    const dialogRef = this.dialog.open(OptionalServiceEditFormComponent, {
      width: '500px',
      data: { serviceId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadOptionalServices();
      }
    });
  }
}
