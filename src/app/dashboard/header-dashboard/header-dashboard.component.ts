import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { AuthService } from '../../services/auth.service';  // Pfad anpassen, falls nötig
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-dashboard',
  standalone: true,
  imports: [MATERIAL_MODULES],
  templateUrl: './header-dashboard.component.html',
  styleUrl: './header-dashboard.component.scss'
})
export class HeaderDashboardComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogout(): void {
    this.authService.logout()
      .then(() => {
        this.router.navigateByUrl('/dashboard-login'); // oder wohin der Nutzer nach dem Logout gelangen soll
      })
      .catch(error => {
        console.error('Logout fehlgeschlagen:', error);
      });
  }
}