import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { VenueViewComponent } from './Admin/venue-view/venue-view.component';
import { DashboardComponent } from './Admin/dashboard/dashboard.component';
import { LayoutComponent } from './Admin/layout/layout.component';
import { RegisterVenueComponent } from './Admin/register-venue/register-venue.component';

import { LeasePackageTableComponent } from './Table/lease-package-table/lease-package-table.component';
import { LeasePackageFormComponent } from './Admin/lease-package-form/lease-package-form.component';
import { BuildinglistComponent } from './Admin/buildinglist/buildinglist.component';
import { ViewVenuesComponent } from './Admin/view-venues/view-venues.component';
import { LoginComponent } from './login/login.component';
// import { StaffDashboardComponent } from './staff/staff-dashboard/staff-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { LeasePackageEditFormComponent } from './Form/lease-package-edit-form/lease-package-edit-form.component';
import { EditVenueComponent } from './edit-venue-component/edit-venue-component.component';
import { MultiStepFormComponent } from './multi-step-form/multi-step-form.component';
import { BookingListComponent } from './booking-list/booking-list.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { StaffAddComponent } from './staff-add/staff-add.component';
import { ActivityFormComponent } from './Admin/activity-form/activity-form.component';
import { ActivityTableComponent } from './Table/activitytable/activitytable.component';
import { PhoneSearchComponent } from './phone-search/phone-search.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { AddBuildingComponent } from './add-building/add-building.component';
import { VenueExplorerComponent } from './components/venue-explorer/venue-explorer.component';

const routes: Routes = [
  
  { path: '', component: HomeComponent },
  { path: 'venue/:id', component: VenueExplorerComponent },
  { path: 'venue', component: VenueViewComponent },
   
  { path: 'dash', component: DashboardComponent },

  { path: 'layout', component: LayoutComponent },
  { path: 'book', component:  MultiStepFormComponent},
  { path: 'login', component: LoginComponent },
  { path: 'booking', component: MultiStepFormComponent },
  { path: 'invoice/:bookingId', component: InvoiceComponent },

   { path: 'mybooking', component: PhoneSearchComponent },
   { path: 'agreeterms', component: TermsAndConditionsComponent},

{ path: 'feedback', component: FeedbackComponent},
  {
    path: 'staff',
    loadChildren: () => import('./staff/staff.module').then(m => m.StaffModule),
    canActivate: [AuthGuard],
    data: { roles: ['STAFF', 'ADMIN'] }
  },

  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'buildings', component: BuildinglistComponent },
      { path: 'leasepackagetable', component: LeasePackageTableComponent },

      // ✅ Corrected lease package routes
      { path: 'leasepackageform', component: LeasePackageFormComponent },
       { path: 'addbuiding', component: AddBuildingComponent },

      { path: 'leasepackageeditform/:id', component: LeasePackageEditFormComponent },
      { path: 'editVenue/:venueId', component: EditVenueComponent },
      { path: 'editVenue', component: EditVenueComponent },


      { path: 'regvenues', component: RegisterVenueComponent },
      { path: 'regvenues/:id', component: RegisterVenueComponent },
      { path: 'venueView', component: ViewVenuesComponent },
    
      { path: 'bookinglist', component: BookingListComponent },
      {path: 'addstaff', component: StaffAddComponent},
      { path: 'activity', component: ActivityFormComponent },
      { path: 'activitytable', component: ActivityTableComponent },


      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default admin page
      { path: '**', redirectTo: 'dashboard' }, // Catch-all

    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
