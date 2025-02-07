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


const routes: Routes = [
  { 
    path: '', 
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'venue', component: VenueComponent },
      { path: 'home', component: HomeComponent },
      
      { path: 'dash', component: DashboardComponent },

      {
        path: 'arafa',
        component: LayoutComponent,
        children: [
          { path: 'dashboard', component: DashboardComponent },
          { path: 'building', component: BuildingComponent},
          { path: 'users', component: UserComponent },
          {path: 'majengo',component:MajengoComponent},
          { path: 'Venues', component: VenueFormComponent },
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
