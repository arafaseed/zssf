import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { VenueViewComponent } from './Admin/venue-view/venue-view.component';
import { DashboardComponent } from './Admin/dashboard/dashboard.component';
import { LayoutComponent } from './Admin/layout/layout.component';
import { VenueComponent } from './components/venue/venue.component';
import { SettingComponent } from './Admin/setting/setting.component';
import { BuildingComponent } from './Admin/building/building.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { RegisterVenueComponent } from './Admin/register-venue/register-venue.component';
import { VenueDisplayComponent } from './Admin/venue-display/venue-display.component';
import { LeasePackageTableComponent } from './Table/lease-package-table/lease-package-table.component';
import { LeasePackageFormComponent } from './Admin/lease-package-form/lease-package-form.component';
import { BuildinglistComponent } from './Admin/buildinglist/buildinglist.component';
import { ViewVenuesComponent } from './Admin/view-venues/view-venues.component';
<<<<<<< HEAD
import { LoginComponent } from './login/login.component';
import { StaffDashboardComponent } from './staff-dashboard/staff-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
=======
import { LeasePackageEditFormComponent } from './Form/lease-package-edit-form/lease-package-edit-form.component';
import { EditVenueComponentComponent } from './edit-venue-component/edit-venue-component.component';
>>>>>>> 5576b934d4d3369aad15bee0a7f1de2b6dda41c8

const routes: Routes = [
  { path: '', redirectTo: 'venue', pathMatch: 'full' },
  // { path: 'home', component: HomeComponent },
  { path: 'venue', component: VenueViewComponent },
  { path: 'booking/:id', component: BookingFormComponent },
  { path: 'reservation', component: HomeComponent },  
  { path: 'Venueslists', component: VenueDisplayComponent },
  { path: 'dash', component: DashboardComponent },
  { path: 'booking', component: BookingFormComponent },
  { path: 'login', component: LoginComponent },
  { path: 'staff-dashboard', component:StaffDashboardComponent,
    canActivate: [AuthGuard], 
    data: { role: 'staff' }

  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [AuthGuard], 
    data: { role: 'admin' } ,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'building', component: BuildingComponent },
      { path: 'buildings', component: BuildinglistComponent },
      { path: 'users', component: VenueComponent },
      { path: 'leasepackagetable', component: LeasePackageTableComponent },

      // ✅ Corrected lease package routes
      { path: 'leasepackageform', component: LeasePackageFormComponent }, // New package
      { path: 'leasepackageeditform/:leaseId', component: LeasePackageEditFormComponent },
      { path: 'editVenue/:venueId', component: RegisterVenueComponent },


      { path: 'regvenues', component: RegisterVenueComponent },
      { path: 'regvenues/:id', component: EditVenueComponentComponent },
      { path: 'venueView', component: ViewVenuesComponent },
      { path: 'settings', component: SettingComponent },

      { path: 'booking-form', component: BookingFormComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default admin page
      { path: '**', redirectTo: 'dashboard' } // Catch-all
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
