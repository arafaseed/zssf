import { Component, OnInit } from '@angular/core';
import { BuildingService } from '../Services/building.service';
import { Building, ViewBuildingService } from '../Services/view-building.service';

@Component({
  selector: 'app-view-building',
  standalone: false,
  templateUrl: './view-building.component.html',
  styleUrl: './view-building.component.css'
})
export class ViewBuildingComponent implements OnInit {
  [x: string]: any;
  buildings: Building[] = [];

  constructor(private buildingService: ViewBuildingService) {}

  ngOnInit(): void {
    this.fetchBuildings();
  }

  fetchBuildings(): void {
    this.buildingService.getAllBuildings().subscribe({
      next: (data: Building[]) => this.buildings = data,
      error: (err: any) => console.error('Error fetching buildings:', err)
    });
  }
}