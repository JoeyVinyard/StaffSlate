import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularFittextModule } from 'angular-fittext';

// Angular Fire Imports
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireFunctionsModule } from '@angular/fire/functions';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule, MatDialog } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon'
import { MatTableModule } from '@angular/material/table'; 
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu'; 
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

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
import { EmployeeComponent } from './components/pages/employee/employee.component';
import { NewEmployeeDialogComponent } from './components/pages/employees/new-employee-dialog/new-employee-dialog.component';
import { NewScheduleDialogComponent } from './components/pages/schedules/new-schedule-dialog/new-schedule-dialog.component';
import { ScheduleComponent } from './components/pages/schedule/schedule.component';
import { NewShiftDialogComponent } from './components/pages/schedule/new-shift-dialog/new-shift-dialog.component';
import { NewSheetDialogComponent } from './components/pages/schedule/new-sheet-dialog/new-sheet-dialog.component';
import { DeleteSheetConfirmationComponent } from './components/pages/schedule/delete-sheet-confirmation/delete-sheet-confirmation.component';
import { HttpClientModule } from '@angular/common/http';
import { ManagerSignupComponent } from './components/pages/manager-signup/manager-signup.component';
import { EmployeeRedirectComponent } from './components/pages/employee-redirect/employee-redirect.component';
import { EmailConfirmRedirectComponent } from './components/pages/email-confirm-redirect/email-confirm-redirect.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    SidenavComponent,
    ToolbarComponent,
    EmployeesComponent,
    SchedulesComponent,
    SettingsComponent,
    EmployeeComponent,
    NewEmployeeDialogComponent,
    NewScheduleDialogComponent,
    ScheduleComponent,
    NewShiftDialogComponent,
    NewSheetDialogComponent,
    DeleteSheetConfirmationComponent,
    ManagerSignupComponent,
    EmployeeRedirectComponent,
    EmailConfirmRedirectComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    AngularFittextModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    DragDropModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    FlexLayoutModule,
    NgxMaterialTimepickerModule,
    HttpClientModule
  ],
  entryComponents: [
    NewEmployeeDialogComponent,
    NewScheduleDialogComponent,
    NewShiftDialogComponent,
    NewSheetDialogComponent,
    DeleteSheetConfirmationComponent
  ],
  providers: [
    AngularFireAuthGuard,
    AngularFirestore,
    MatDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
