import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { VenueComponent } from './components/venue/venue.component';
import { DashboardComponent } from './Admin/dashboard/dashboard.component';
import { LayoutComponent } from './Admin/layout/layout.component';
import { UserComponent } from './Admin/user/user.component';  // Corrected import
import { SettingComponent } from './Admin/setting/setting.component';
import { BuildingComponent } from './Admin/building/building.component';
import { VenueFormComponent } from './Admin/venue-form/venue-form.component';
import { MajengoComponent } from './Admin/majengo/majengo.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { LeasePackageFormComponent } from './Admin/lease-package-form/lease-package-form.component';
import { RegisterVenueComponent } from './Admin/register-venue/register-venue.component';
import { LeasePackageTableComponent } from './Table/lease-package-table/lease-package-table.component';










const routes: Routes = [
  { 
    path: '', 
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'venue', component: VenueComponent },
      { path: 'home', component: HomeComponent },
      { path: 'Table', component: LeasePackageTableComponent },

     
  { path: 'reservation', component: HomeComponent }, // Create this component for the reservation page

      { path: 'dash', component: DashboardComponent },
      { path: 'booking', component: BookingFormComponent },


      {
        path: 'admin',
        component: LayoutComponent,
        children: [
          { path: 'dashboard', component: DashboardComponent },
          { path: 'building', component: BuildingComponent},
          { path: 'users', component: VenueComponent },
          {path: 'majengo',component:MajengoComponent},
          {path: 'leasepackage',component:LeasePackageFormComponent},
          {path: 'regvenues',component:RegisterVenueComponent},
          // { path: 'Venues', component: VenueFormComponent },
          { path: 'settings', component: SettingComponent },  // Correct path for SettingsComponent
        ]
      }
    ] 
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
