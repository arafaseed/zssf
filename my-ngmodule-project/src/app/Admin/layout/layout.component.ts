import { Component } from '@angular/core';
import { AuthService } from '../../Services/auth.service';

@Component({
  standalone: false,
  selector: 'app-admin-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']          // only a few tweaks
})
export class LayoutComponent {

  /** collapsible sidebar (true = visible) */
  isSidebarOpen = false;

  constructor(private auth: AuthService) {}

  // --- convenience getters for the template ------------------------------
  get adminId(): string | null   { return this.auth.getUsername(); }
  get role(): string | null      { return this.auth.role; }

  toggleSidebar(): void { this.isSidebarOpen = !this.isSidebarOpen; }

  logout(): void {
    this.auth.logout();
  }
}
