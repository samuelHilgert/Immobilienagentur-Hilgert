import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../shared/material-imports';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [MATERIAL_MODULES, RouterLink],
  templateUrl: './impressum.component.html',
  styleUrl: './impressum.component.scss',
})
export class ImpressumComponent {}
