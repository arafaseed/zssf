import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard-switch',
  standalone: false,
  templateUrl: './dashboard-switch.component.html',
  styleUrl: './dashboard-switch.component.css'
})
export class DashboardSwitchComponent {
   isAdmin: boolean = false;
  currentDashboard: 'admin' | 'staff' = 'admin';

  constructor(private router: Router) {
    this.checkRole();
    this.router.events.subscribe(() => {
    this.detectCurrentDashboard();
  });
  }

  private checkRole(): void {
    const role = sessionStorage.getItem('auth-role');
    this.isAdmin = role === 'ADMIN';
  }

  private detectCurrentDashboard(): void {
    const path = this.router.url;
    if (path.includes('/staff')) {
      this.currentDashboard = 'staff';
    } else if (path.includes('/admin')) {
      this.currentDashboard = 'admin';
    }
  }

  switchDashboard(): void {
    this.detectCurrentDashboard(); 
    const newRoute = this.currentDashboard === 'admin' ? '/staff/dashboard' : '/admin/dashboard';
    this.router.navigate([newRoute]);
  }

}
