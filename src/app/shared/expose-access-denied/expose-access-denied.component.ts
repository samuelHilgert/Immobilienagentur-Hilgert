import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../material-imports';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-expose-access-denied',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, RouterModule],
  templateUrl: './expose-access-denied.component.html',
  styleUrl: './expose-access-denied.component.scss',
})

export class ExposeAccessDeniedComponent {}
