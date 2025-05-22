import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: StaffDashboardComponent,
    children: [
      { path: '', component: HomeComponent },
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }
