import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { VenueStateService } from '../../Services/venue-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  

  activeTab: string = 'checkin';

  private venueSubscription!: Subscription;

  constructor(
    private auth: AuthService,
    private venueState: VenueStateService
  ) {}

  get staffIdentification(): string | null {
    return this.auth.getStaffIdentification();
  }

  get role(): string | null {
    return this.auth.role;
  }

  ngOnInit(): void {
    sessionStorage.setItem('activeTab', this.activeTab);

    // 👇 Subscribe to venue change notifications
    this.venueSubscription = this.venueState.venueChanged$.subscribe(() => {
      this.refreshComponent();
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    sessionStorage.setItem('activeTab', tab);
  }
  refreshComponent(): void {
    const currentTab = this.activeTab;
  this.activeTab = ''; // force ngIf blocks (in template) to unload
  sessionStorage.removeItem('activeTab');

  // Step 2: Wait a short moment and re-set the tab to reload it
  setTimeout(() => {
    this.activeTab = currentTab;
    sessionStorage.setItem('activeTab', currentTab);
    console.log(`Refreshed active tab: ${currentTab}`);
  }, 50); 
  }

  ngOnDestroy(): void {
    if (this.venueSubscription) {
      this.venueSubscription.unsubscribe();
    }
  }

  emitToggle() {
    this.toggleSidebar.emit();
  }
}