import { Routes } from '@angular/router';
import { LoginComponent } from './components/pages/login/login.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const appRoutes: Routes = [
    { path: "", redirectTo: '/dashboard', pathMatch: "full"},
    { path: "login", component: LoginComponent },
    { path: "dashboard", component: DashboardComponent, canActivate: [AngularFireAuthGuard], data: {authGuardPipe: redirectUnauthorizedToLogin} }
]