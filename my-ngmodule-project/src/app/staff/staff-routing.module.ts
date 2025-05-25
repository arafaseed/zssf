import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: StaffDashboardComponent,
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }
