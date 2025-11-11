// src/app/Admin/layout/layout.component.ts
import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  // Mobile overlay state (true = visible)
  isSidebarOpen = false;

  // Desktop collapsed vs expanded (true = expanded/full width)
  isSidebarExpanded = true;

  // Derived breakpoint state
  isMobile = false;

  // Navigation items (icons from Material Icons)
  navItems = [
    { label: 'Dashboard', link: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Optional Service', link: '/admin/tableoptional', icon: 'playlist_add_circle' },
    { label: 'Buildings', link: '/admin/buildings', icon: 'apartment' },
    { label: 'Venues', link: '/admin/venueView', icon: 'location_city' },
   // { label: 'Bookings', link: '/admin/bookinglist', icon: 'event_note' },
    { label: 'Staff', link: '/admin/staff', icon: 'people' },
    { label: 'Activity', link: '/admin/activitytable', icon: 'event' },
    { label: 'Report', link: '/admin/report', icon: 'summarize' },
    { label: 'Customer Feedback', link: '/admin/feedback', icon: 'feedback' },
    { label: 'Policy Settings', link: '/admin/policies-settings', icon: 'settings' },
    //{ label: 'Admin Report', link: '/admin/admin-reports', icon: 'report' },
    { label: 'Payments', link: '/admin/payment-list', icon: 'payments' },
    { label: 'Charts', link: '/admin/app-report', icon: 'bar_chart' },


     
  ];

  constructor(private auth: AuthService) {
    this.onResize(); // initialize isMobile on construction
  }

  // Auth helpers
  get adminId(): string | null { return this.auth.getUsername(); }
  get role(): string | null { return this.auth.role; }

  // Toggle sidebar for mobile (overlay)
  toggleSidebarMobile(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Toggle collapse/expand for desktop
  toggleSidebarDesktop(): void {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  // Generic toggle used in older code paths — keep for compatibility
  toggleSidebar(): void {
    if (this.isMobile) this.toggleSidebarMobile();
    else this.toggleSidebarDesktop();
  }

  // Close mobile sidebar when clicking overlay
  closeSidebarOnMobile(): void {
    this.isSidebarOpen = false;
  }

  logout(): void {
    this.auth.logout();
  }

  // Keep layout responsive
  @HostListener('window:resize', [])
  onResize() {
    try {
      this.isMobile = window.innerWidth < 1024; // tailwind 'lg' breakpoint ~= 1024px
      if (this.isMobile) {
        // On mobile ensure sidebar collapsed and closed overlay by default
        this.isSidebarExpanded = false;
        this.isSidebarOpen = false;
      } else {
        // On desktop ensure overlay is off
        this.isSidebarOpen = false;
        // Keep existing isSidebarExpanded value (let the user control)
      }
    } catch (e) {
      this.isMobile = false;
    }
  }
}
