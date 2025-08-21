import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { VenueViewComponent } from './Admin/venue-view/venue-view.component';
import { DashboardComponent } from './Admin/dashboard/dashboard.component';
import { LayoutComponent } from './Admin/layout/layout.component';
import { RegisterVenueComponent } from './Admin/register-venue/register-venue.component';
import { BuildinglistComponent } from './Admin/buildinglist/buildinglist.component';
import { ViewVenuesComponent } from './Admin/view-venues/view-venues.component';
import { LoginComponent } from './login/login.component';
// import { StaffDashboardComponent } from './staff/staff-dashboard/staff-dashboard.component';
import { AuthGuard } from './guards/auth.guard';

import { EditVenueComponent } from './edit-venue-component/edit-venue-component.component';
import { MultiStepFormComponent } from './multi-step-form/multi-step-form.component';
import { BookingListComponent } from './booking-list/booking-list.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { ActivityFormComponent } from './Admin/activity-form/activity-form.component';
import { ActivityTableComponent } from './Table/activitytable/activitytable.component';
import { PhoneSearchComponent } from './phone-search/phone-search.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { AddBuildingComponent } from './add-building/add-building.component';
import { VenueExplorerComponent } from './components/venue-explorer/venue-explorer.component';
import { OptionalServiceAddFormComponent } from './Form/optional-service-add-form/optional-service-add-form.component';
import { OptionalServiceEditFormComponent } from './Form/optional-service-edit-form/optional-service-edit-form.component';
import { OptionalServiceTableComponent } from './Admin/optional-service-table/optional-service-table.component';
import { StaffFormComponent } from './staff-form/staff-form.component';
<<<<<<< HEAD
import { PoliciesSettingsComponent } from './Admin/policies-settings/policies-settings.component';
=======
import { StaffTableComponent } from './staff-table/staff-table.component';
>>>>>>> 05b25b1eec20fb9a76b78f9a1aec1ab21039de4f




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
  
       { path: 'addbuiding', component: AddBuildingComponent },
      { path: 'editVenue/:venueId', component: EditVenueComponent },
      { path: 'editVenue', component: EditVenueComponent },


      { path: 'regvenues', component: RegisterVenueComponent },
      { path: 'regvenues/:id', component: RegisterVenueComponent },
      { path: 'venueView', component: ViewVenuesComponent },
    
      { path: 'bookinglist', component: BookingListComponent },
      { path: 'activity', component: ActivityFormComponent },
      { path: 'staff', component: StaffTableComponent },

      { path: 'activitytable', component: ActivityTableComponent },
      { path: 'policies-settings', component: PoliciesSettingsComponent },
       { path: 'addoptional', component: OptionalServiceAddFormComponent },
      {path: 'editoptional', component: OptionalServiceEditFormComponent},
      { path: 'tableoptional', component: OptionalServiceTableComponent },

       { path: 'staff/add', component: StaffFormComponent },


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
