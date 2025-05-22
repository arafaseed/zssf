import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  activeTab: string = 'checkin';

  constructor(private auth: AuthService) {}

  get staffIDN(): string | null {
    return this.auth.getStaffIDN(); // Make sure this method exists in AuthService
  }

  get role(): string | null {
    return this.auth.role;
  }

  ngOnInit(): void {
    localStorage.setItem('activeTab', this.activeTab);
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab);
  }
}