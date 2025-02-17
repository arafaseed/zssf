import { NgModule } from '@angular/core';
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
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VenueFormComponent } from './Admin/venue-form/venue-form.component';
<<<<<<< HEAD
import { MajengoComponent } from './Admin/majengo/majengo.component';
import { HttpClientModule } from '@angular/common/http';
import { BuildingService } from './building.service';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BookingFormComponent } from './booking-form/booking-form.component';

import { LeasePackageFormComponent } from './Admin/lease-package-form/lease-package-form.component';
import { RegisterVenueComponent } from './Admin/register-venue/register-venue.component';
import { CommonModule } from '@angular/common';
import { ReservationComponent } from './Admin/reservation/reservation.component';





=======

import { HttpClientModule } from '@angular/common/http';
import { BuildingService } from './building.service';

import { BookingFormComponent } from './booking-form/booking-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';



import { RegisterVenueComponent } from './Admin/register-venue/register-venue.component';
import { LeasePackageTableComponent } from './Table/lease-package-table/lease-package-table.component';
import { LeasePackageEditFormComponent } from './Form/lease-package-edit-form/lease-package-edit-form.component';
import { BuildinglistComponent } from './Admin/buildinglist/buildinglist.component';
import { VenueViewComponent } from './Admin/venue-view/venue-view.component';
import { ViewVenuesComponent } from './Admin/view-venues/view-venues.component';
import { MatError } from '@angular/material/form-field';



import { CommonModule } from '@angular/common';
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc



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
<<<<<<< HEAD
    MajengoComponent,
    BookingFormComponent,
    LeasePackageFormComponent,
    RegisterVenueComponent,
    ReservationComponent,
  
  
=======
  
   
    RegisterVenueComponent,
    LeasePackageTableComponent,
    LeasePackageEditFormComponent,
    BuildinglistComponent,
    VenueViewComponent,
    ViewVenuesComponent,
    
 
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc
    
   

    
  ],
  imports: [
    BrowserModule,
    MatSelectModule,
    AppRoutingModule,
    MatToolbarModule,
    HeaderComponent,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    BrowserModule,
    MatInputModule,
    MatDatepickerModule,    // import MatDatepickerModule
    MatInputModule,         // import MatInputModule for the input field
    MatNativeDateModule,
    MatToolbarModule,
<<<<<<< HEAD
    ReactiveFormsModule,
=======
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule,
<<<<<<< HEAD
    ReactiveFormsModule,
    CommonModule,
=======
    MatError,
    ReactiveFormsModule,
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc
    BrowserModule,
    HttpClientModule,
    MatButtonModule, 
    FormsModule,
<<<<<<< HEAD
    
   
     
    
=======
    MatTableModule,
    MatSortModule,
     
    BookingFormComponent,
>>>>>>> c74caa8baa1527cb681a91f38722b98634cde0bc
    
   

    
  ],
  providers: [
    provideAnimationsAsync(), BuildingService, 
  ],
  bootstrap: [AppComponent],
  
})
export class AppModule { }
