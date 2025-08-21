import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HomeComponent } from './components/home/home.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DashboardComponent } from './Admin/dashboard/dashboard.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { LayoutComponent } from './Admin/layout/layout.component';

import { MatCardModule, MatCard, MatCardTitle } from '@angular/material/card';
import { MatFormFieldModule, MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VenueFormComponent } from './Admin/venue-form/venue-form.component';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { BuildingService } from './Services/building.service';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { RegisterVenueComponent } from './Admin/register-venue/register-venue.component';
import { BuildinglistComponent } from './Admin/buildinglist/buildinglist.component';
import { VenueViewComponent } from './Admin/venue-view/venue-view.component';
import { ViewVenuesComponent } from './Admin/view-venues/view-venues.component';

import { CommonModule, DatePipe } from '@angular/common';
import { MajengoComponent } from './Admin/majengo/majengo.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { LoginComponent } from './login/login.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { EditVenueComponent} from './edit-venue-component/edit-venue-component.component';
import { BookingService } from './Services/booking.service';
import { MultiStepFormComponent } from './multi-step-form/multi-step-form.component';
import { BookingListComponent } from './booking-list/booking-list.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivityFormComponent } from './Admin/activity-form/activity-form.component';import { ActivityTableComponent } from './Table/activitytable/activitytable.component';
import { ActivityEditFormComponent } from './Form/activity-edit-form/activity-edit-form.component';
import { PhoneSearchComponent } from './phone-search/phone-search.component';
import { StaffModule } from "./staff/staff.module";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ViewBuildingComponent } from './view-building/view-building.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatMenuModule } from '@angular/material/menu';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { BuildingEditFormComponent } from './Form/building-edit-form/building-edit-form.component';
import { AddBuildingComponent } from './add-building/add-building.component';

import { VenueCardComponent } from './components/venue-card/venue-card.component';
import { VenueExplorerComponent } from './components/venue-explorer/venue-explorer.component';
import { LucideAngularModule } from 'lucide-angular';
import { BookingModalComponent } from './components/booking-modal/booking-modal.component';
import { EmployeeVerifyComponent } from './components/employee-verify/employee-verify.component';
import { ConfirmBookingComponent } from './components/confirm-booking/confirm-booking.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { AvailabilityModalComponent } from './components/availability-modal/availability-modal.component';
import { OptionalServiceTableComponent } from './Admin/optional-service-table/optional-service-table.component';
import { OptionalServiceEditFormComponent } from './Form/optional-service-edit-form/optional-service-edit-form.component';
import { OptionalServiceAddFormComponent } from './Form/optional-service-add-form/optional-service-add-form.component';

import { StaffTableComponent } from './staff-table/staff-table.component';
import { StaffDialogComponent } from './staff-dialog.component/staff-dialog.component';
import { StaffFormComponent } from './staff-form/staff-form.component';
import { PoliciesSettingsComponent } from './Admin/policies-settings/policies-settings.component';






// Translate Http Loader Factory with new signature

export function createTranslateLoader(http: HttpClient) {
  // Just pass http, no other arguments — this is new in v7+
  return new TranslateHttpLoader(http, "./assets/i18n/", '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HomeComponent,
    VenueCardComponent,
    VenueExplorerComponent,
    DashboardComponent,
    LayoutComponent,
    VenueFormComponent,
    MajengoComponent,
    RegisterVenueComponent,
    BuildinglistComponent,
    VenueViewComponent,
    ViewVenuesComponent,
    LoginComponent,
    EditVenueComponent,
    MultiStepFormComponent,
    BookingListComponent,
    ConfirmDialogComponent,
    InvoiceComponent,
    StaffTableComponent,
    ActivityFormComponent,
    ActivityTableComponent,
    ActivityEditFormComponent,
    BuildingEditFormComponent,
    PhoneSearchComponent,
    ViewBuildingComponent,
    TermsAndConditionsComponent,
    FeedbackComponent,
    AddBuildingComponent,
    BookingModalComponent,
    EmployeeVerifyComponent,
    ConfirmBookingComponent,
    AvailabilityModalComponent,
    OptionalServiceTableComponent,
    OptionalServiceEditFormComponent,
    OptionalServiceAddFormComponent,
    StaffDialogComponent,
    StaffFormComponent,
    PoliciesSettingsComponent,

    // DashboardSwitchComponent,
    

  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TranslateModule,
    MatButtonModule,
    MatToolbarModule,
    HeaderComponent,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatStepperModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    FullCalendarModule,
    StaffModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    LucideAngularModule,
    MatCheckboxModule,
    MatRadioModule,
    


 TranslateModule.forRoot({
  loader: {
    provide: TranslateLoader,
    useFactory: createTranslateLoader,
    deps: [HttpClient]
  },

})

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideAnimationsAsync(),
    BuildingService,
    BookingService,
    JwtHelperService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
  ],
  bootstrap: [AppComponent],
  
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
