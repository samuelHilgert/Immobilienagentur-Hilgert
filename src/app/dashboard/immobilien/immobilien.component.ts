import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { ImmobilienDatenbankComponent } from './immobilien-datenbank/immobilien-datenbank.component';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { filter } from 'rxjs';

@Component({
  selector: 'app-immobilien',
  standalone: true,
  imports: [MATERIAL_MODULES, RouterModule, ImmobilienDatenbankComponent],
  templateUrl: './immobilien.component.html',
  styleUrl: './immobilien.component.scss'
})

export class ImmobilienComponent {
  isMainView = true;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentUrl = this.router.url;
      // Nur anzeigen, wenn WIRKLICH Hauptansicht
      this.isMainView = currentUrl === '/dashboard/immobilien';
    });
  }
}