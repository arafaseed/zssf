import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { StaffRoutingModule } from './staff-routing.module';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CheckInListComponent } from './home/check-in-list/check-in-list.component';
import { CheckOutListComponent } from './home/check-out-list/check-out-list.component';
import { CheckoutModalComponent } from './modals/checkout-modal/checkout-modal.component';
import { CancelledListComponent } from './home/cancelled-list/cancelled-list.component';
import { ReportsComponent } from './home/reports/reports.component';
import { DashboardSwitchComponent } from './dashboard-switch/dashboard-switch.component';
import { MatCardModule }   from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
// … other imports




@NgModule({
  declarations: [
    StaffDashboardComponent,
    NavbarComponent,
    HomeComponent,
    CheckInListComponent,
    CheckOutListComponent,
    CheckoutModalComponent,
    CancelledListComponent,
    ReportsComponent,
    DashboardSwitchComponent,
   ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StaffRoutingModule,
    HttpClientModule,
    RouterModule,
    MatCardModule,
    MatButtonModule
],
  exports: [DashboardSwitchComponent]

})
export class StaffModule { }
