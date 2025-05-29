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



@NgModule({
  declarations: [
    StaffDashboardComponent,
    NavbarComponent,
    HomeComponent,
    CheckInListComponent,
    CheckOutListComponent,
    CheckoutModalComponent
   ],
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    StaffRoutingModule,
    HttpClientModule,
    RouterModule
  ],
  exports: []
})
export class StaffModule { }
