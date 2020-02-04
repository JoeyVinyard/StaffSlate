import { Routes } from '@angular/router';
import { LoginComponent } from './components/pages/login/login.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { EmployeesComponent } from './components/pages/employees/employees.component';
import { SchedulesComponent } from './components/pages/schedules/schedules.component';
import { SettingsComponent } from './components/pages/settings/settings.component';
import { ScheduleComponent } from './components/pages/schedule/schedule.component';
import { LocationGuard } from './guards/location.guard';
import { ManagerSignupComponent } from './components/pages/manager-signup/manager-signup.component';
import { EmployeeRedirectComponent } from './components/pages/employee-redirect/employee-redirect.component';
import { EmailConfirmRedirectComponent } from './components/pages/email-confirm-redirect/email-confirm-redirect.component';
import { ConfirmEmailGuard } from './guards/confirm-email.guard';
import { NoLocationGuard } from './guards/no-location.guard';
import { NewLocationComponent } from './components/pages/new-location/new-location.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['register']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

export const appRoutes: Routes = [
    {
        path: "",
        redirectTo: '/dashboard',
        pathMatch: "full"
    },
    {
        path: "register",
        component: ManagerSignupComponent,
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectLoggedInToDashboard}
    },
    {
        path: "login",
        component: LoginComponent,
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectLoggedInToDashboard}
    },
    {
        path: "confirm",
        component: EmailConfirmRedirectComponent,
        canActivate: [AngularFireAuthGuard, ConfirmEmailGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin}
    },
    {
        path: "new-location",
        component: NewLocationComponent,
        canActivate: [AngularFireAuthGuard, ConfirmEmailGuard, NoLocationGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin}
    },
    {
        path: "employee-redirect",
        component: EmployeeRedirectComponent,
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectLoggedInToDashboard}
    },
    {
        path: "dashboard",
        component: DashboardComponent,
        canActivate: [AngularFireAuthGuard, ConfirmEmailGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin}
    },
    {
        path: "employees",
        component: EmployeesComponent,
        canActivate: [AngularFireAuthGuard, ConfirmEmailGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin}
    },
    {
        path: "schedules",
        component: SchedulesComponent,
        canActivate: [AngularFireAuthGuard, ConfirmEmailGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin}
    },
    {
        path: "schedule/:locationId/:scheduleId",
        component: ScheduleComponent,
        canActivate: [AngularFireAuthGuard, LocationGuard, ConfirmEmailGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin}
    },
    {
        path: "schedule/:locationId/:scheduleId/:viewId",
        component: ScheduleComponent,
        canActivate: [LocationGuard],
        data: {guest: true}
    },
    {
        path: "settings",
        component: SettingsComponent,
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin}
    }
]