import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material-imports';

@Component({
  selector: 'app-dash-start',
  standalone: true,
  imports: [MATERIAL_MODULES, RouterModule],
  templateUrl: './dash-start.component.html',
  styleUrl: './dash-start.component.scss'
})

export class DashStartComponent {

}
