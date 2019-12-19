import { Routes } from '@angular/router';
import { LoginComponent } from './components/pages/login/login.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { EmployeesComponent } from './components/pages/employees/employees.component';
import { SchedulesComponent } from './components/pages/schedules/schedules.component';
import { SettingsComponent } from './components/pages/settings/settings.component';
import { ScheduleComponent } from './components/pages/schedule/schedule.component';
import { UserGuard } from './guards/user.guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

export const appRoutes: Routes = [
    {
        path: "",
        redirectTo: '/dashboard',
        pathMatch: "full"
    },
    {
        path: "login",
        component: LoginComponent,
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectLoggedInToDashboard}

    },
    {
        path: "dashboard",
        component: DashboardComponent,
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin}
    },
    {
        path: "employees",
        component: EmployeesComponent,
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin}
    },
    {
        path: "schedules",
        component: SchedulesComponent,
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin}
    },
    {
        path: "schedule/:scheduleId",
        component: ScheduleComponent,
        canActivate: [UserGuard, AngularFireAuthGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin}
    },
    {
        path: "settings",
        component: SettingsComponent,
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectUnauthorizedToLogin}
    }
]