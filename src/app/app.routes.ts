import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { DashboardLoginComponent } from './dashboard-login/dashboard-login.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent, // Hier wird das Hauptlayout mit router-outlet genutzt
    children: [
      // Deine Child-Komponenten für das Main Layout
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLoginComponent, // Diese Route ist eigenständig!
  },
  {
    path: 'dashboard/Hilgert-Immobilien',
    component: DashboardLoginComponent, // Diese Route ist eigenständig!
  },
  { path: '**', redirectTo: '' } // Fallback
];
