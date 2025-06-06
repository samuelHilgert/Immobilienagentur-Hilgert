import { Component } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { filter } from 'rxjs';

@Component({
  selector: 'app-immobilien',
  standalone: true,
  imports: [MATERIAL_MODULES, RouterModule],
  templateUrl: './immobilien.component.html',
  styleUrl: './immobilien.component.scss',
})

export class ImmobilienComponent {
  showTopMenu = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        this.showTopMenu =
          !event.urlAfterRedirects.includes('immobilie-anlegen');
      });
  }
}
