import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FlexLayoutModule } from '@angular/flex-layout';

// Angular Fire Imports
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { AngularFireStorageModule } from '@angular/fire/storage';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon'

// Config Files
import { appRoutes } from "./routes";
import { environment } from '../environments/environment';

// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './components/pages/login/login.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { SidenavComponent } from './components/core/sidenav/sidenav.component';
import { ToolbarComponent } from './components/core/toolbar/toolbar.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { EmployeesComponent } from './components/pages/employees/employees.component';
import { SchedulesComponent } from './components/pages/schedules/schedules.component';
import { SettingsComponent } from './components/pages/settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    SidenavComponent,
    ToolbarComponent,
    EmployeesComponent,
    SchedulesComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireStorageModule,
    FlexLayoutModule
  ],
  providers: [
    AngularFireAuthGuard,
    AngularFirestore
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
