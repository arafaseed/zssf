import { Component, OnInit } from '@angular/core';
import { BuildinglistService } from '../../Sercice/buildinglist.service';

@Component({
  selector: 'app-buildinglist',
  standalone: false,
  templateUrl: './buildinglist.component.html',
  styleUrls: ['./buildinglist.component.css']
})
export class BuildinglistComponent implements OnInit {

  buildings: any[] = [];

  constructor(private buildingService: BuildinglistService) {}

  ngOnInit(): void {
    this.fetchBuildings();
  }

  fetchBuildings(): void {
    this.buildingService.getBuildings().subscribe(
      (data) => {
        this.buildings = data;
      },
      (error) => {
        console.error('Error fetching buildings:', error);
      }
    );
  }

  deleteBuilding(id: number): void {
    if (confirm('Are you sure you want to delete this building?')) {
      this.buildingService.deleteBuilding(id).subscribe(() => {
        this.buildings = this.buildings.filter(building => building.id !== id);
        console.log(`Building with ID ${id} deleted successfully.`);
      }, (error) => {
        console.error('Error deleting building:', error);
      });
    }
  }
}
