import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { DashboardLoginComponent } from './dashboard-login/dashboard-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
  {
    path: 'dashboard',
    component: DashboardLoginComponent,
  },
  {
    path: 'dashboard/Hilgert-Immobilien',
    component: DashboardComponent,
    canActivate: [AuthGuard] // 🔐 Schützt das Dashboard
  },
  { path: '**', redirectTo: '' }
];
