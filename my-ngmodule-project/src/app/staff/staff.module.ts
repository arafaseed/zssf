import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StaffRoutingModule } from './staff-routing.module';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    StaffDashboardComponent,
    NavbarComponent,
    HomeComponent
   ],
  imports: [
    CommonModule,
    StaffRoutingModule,
    HttpClientModule,
    RouterModule
  ]
})
export class StaffModule { }
