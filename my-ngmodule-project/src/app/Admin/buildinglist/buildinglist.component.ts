import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BuildinglistService } from '../../Services/buildinglist.service';
import { BuildingEditFormComponent } from '../../Form/building-edit-form/building-edit-form.component';

@Component({
  selector: 'app-buildinglist',
  templateUrl: './buildinglist.component.html',
  standalone:false,
  styleUrls: ['./buildinglist.component.css']
})
export class BuildinglistComponent implements OnInit {

  buildings: any[] = [];
  displayedColumns: string[] = ['buildingName', 'address', 'actions'];

  constructor(
    private buildingService: BuildinglistService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadBuildings();
  }

  loadBuildings() {
    this.buildingService.getBuildings().subscribe(data => {
      this.buildings = data;
    });
  }

  openEditDialog(buildingId: number) {
    const dialogRef = this.dialog.open(BuildingEditFormComponent, {
      width: '400px',
      data: { buildingId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBuildings();  // Reload buildings after edit
      }
    });
  }

  deleteBuilding(id: number) {
    if (confirm('Are you sure you want to delete this building?')) {
      this.buildingService.deleteBuilding(id).subscribe(() => {
        this.loadBuildings();  // Reload buildings after delete
      }, error => {
        console.error('Delete failed', error);
      });
    }
  }
}
