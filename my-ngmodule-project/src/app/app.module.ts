import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HomeComponent } from './components/home/home.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { VenueComponent } from './components/venue/venue.component';
import { DashboardComponent } from './Admin/dashboard/dashboard.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { LayoutComponent } from './Admin/layout/layout.component';
import { UserComponent } from './Admin/user/user.component';
import { SettingComponent } from './Admin/setting/setting.component';
import { BuildingComponent } from './Admin/building/building.component';
import { MatCard, MatCardModule, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VenueFormComponent } from './Admin/venue-form/venue-form.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BuildingService } from './Services/building.service';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { RegisterVenueComponent } from './Admin/register-venue/register-venue.component';
import { LeasePackageTableComponent } from './Table/lease-package-table/lease-package-table.component';
import { LeasePackageEditFormComponent } from './Form/lease-package-edit-form/lease-package-edit-form.component';
import { BuildinglistComponent } from './Admin/buildinglist/buildinglist.component';
import { VenueViewComponent } from './Admin/venue-view/venue-view.component';
import { ViewVenuesComponent } from './Admin/view-venues/view-venues.component';
import { MatError } from '@angular/material/form-field';
import { CommonModule, DatePipe } from '@angular/common';
import { MajengoComponent } from './Admin/majengo/majengo.component';
import { LeasePackageFormComponent } from './Admin/lease-package-form/lease-package-form.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { LoginComponent } from './login/login.component';
// import { StaffDashboardComponent } from './staff/staff-dashboard/staff-dashboard.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { EditVenueComponentComponent } from './edit-venue-component/edit-venue-component.component';
import { BookingService } from './Services/booking.service';
import { MultiStepFormComponent } from './multi-step-form/multi-step-form.component';
import { BookingListComponent } from './booking-list/booking-list.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { StaffAddComponent } from './staff-add/staff-add.component';
import { MatSnackBarModule }   from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivityFormComponent } from './Admin/activity-form/activity-form.component';

import { AdminbookingComponent } from './adminbooking/adminbooking.component';
import { ActivityTableComponent } from './activitytable/activitytable.component';
import { ActivityEditFormComponent } from './Form/activity-edit-form/activity-edit-form.component';
import { PhoneSearchComponent } from './phone-search/phone-search.component';
import { StaffModule } from "./staff/staff.module";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// import { DashboardSwitchComponent } from './Admin/dashboard-switch/dashboard-switch.component';


@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HomeComponent,
    VenueComponent,
    DashboardComponent,
    LayoutComponent,
    UserComponent,
    SettingComponent,
    VenueFormComponent,
    BuildingComponent,
    MajengoComponent,
    RegisterVenueComponent,
    LeasePackageTableComponent,
    LeasePackageEditFormComponent,
    BuildinglistComponent,
    VenueViewComponent,
    ViewVenuesComponent,
    LeasePackageFormComponent,
    LoginComponent,
    EditVenueComponentComponent,
    MultiStepFormComponent,
    BookingListComponent,
    ConfirmDialogComponent,
    InvoiceComponent,
    StaffAddComponent,
    ActivityFormComponent,
    ActivityTableComponent,
    ActivityEditFormComponent,
    PhoneSearchComponent,
    // DashboardSwitchComponent,
    

  ],
  imports: [
    MatTooltipModule,
    MatDatepickerModule,
    FullCalendarModule,
    MatCardModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    BrowserModule,
    MatSelectModule,
    AppRoutingModule,
    MatToolbarModule,
    MatStepperModule,
    HeaderComponent,
    MatButtonModule,
    MatFormField,
    MatCardModule,
    MatFormFieldModule,
    BrowserModule,
    MatInputModule,
    MatDatepickerModule, // import MatDatepickerModule
    MatInputModule, // import MatInputModule for the input field
    MatNativeDateModule,
    MatToolbarModule,
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule,
    MatError,
    MatCardTitle,
    FormsModule,
    MatCard,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatLabel,
    FormsModule,
    CommonModule,
    BrowserModule,
    DatePipe,
    StaffModule,
    MatProgressSpinnerModule 
],
  // exports: [DashboardSwitchComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideAnimationsAsync(),
    BuildingService,
    BookingService,
    JwtHelperService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
