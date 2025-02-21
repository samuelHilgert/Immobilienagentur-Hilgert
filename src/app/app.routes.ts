import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { DashboardLoginComponent } from './dashboard-login/dashboard-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './services/auth.guard';
import { ImmobilieAnlegenComponent } from './dashboard/immobilie-anlegen/immobilie-anlegen.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
  {
    path: 'dashboard-login',
    component: DashboardLoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard], // 🔐 Schützt das Dashboard
    children: [  // 👈 Nested Routes innerhalb des Dashboards!
    { path: 'immobilie-anlegen', component: ImmobilieAnlegenComponent }
  ]
  },
  { path: '**', redirectTo: '' }
];
