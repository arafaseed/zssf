import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';
import { InvoiceScannerComponent } from './invoice-scanner/invoice-scanner.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: StaffDashboardComponent,
  },
  {
    path: 'scan-invoice',
    component: InvoiceScannerComponent,
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }
