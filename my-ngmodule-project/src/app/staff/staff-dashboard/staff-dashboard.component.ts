// src/app/staff/staff-dashboard/staff-dashboard.component.ts
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-staff-dashboard',
  standalone: false,
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.css']
})
export class StaffDashboardComponent {
  isSidebarOpen: boolean = false;      // mobile overlay
  isSidebarExpanded: boolean = true;   // desktop expanded vs collapsed
  isMobile: boolean = false;

  constructor() {
    this.onResize();
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.isSidebarOpen = !this.isSidebarOpen;
    } else {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    }
  }

  // receives expand toggle from navbar (keeps state in sync)
  onNavbarExpandChanged(expanded: boolean) {
    this.isSidebarExpanded = expanded;
  }

  @HostListener('window:resize', [])
  onResize() {
    try {
      this.isMobile = window.innerWidth < 1024;
      if (this.isMobile) {
        this.isSidebarExpanded = false;
        this.isSidebarOpen = false;
      } else {
        this.isSidebarOpen = false;
      }
    } catch {
      this.isMobile = false;
    }
  }
}
