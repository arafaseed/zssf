import { Component, EventEmitter, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  activeTab: string = 'checkin';
  staffName: string = 'Default Admin';
  staffIDN: string = 'ADMIN-000001';

  ngOnInit(): void {
    localStorage.setItem('staffName', this.staffName);
    localStorage.setItem('staffIDN', this.staffIDN);
    localStorage.setItem('activeTab', this.activeTab);
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab);
  }
}
