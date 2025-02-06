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
import { ReactiveFormsModule } from '@angular/forms';
import { VenueFormComponent } from './Admin/venue-form/venue-form.component';
import { MajengoComponent } from './Admin/majengo/majengo.component';
import { HttpClientModule } from '@angular/common/http';
import { BuildingService } from './building.service';




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
    MatDatepickerModule,    // import MatDatepickerModule
    MatInputModule,         // import MatInputModule for the input field
    MatNativeDateModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
     
    
   

    
  ],
  providers: [
    provideAnimationsAsync(), BuildingService, 
  ],
  bootstrap: [AppComponent],
  
})
export class AppModule { }
