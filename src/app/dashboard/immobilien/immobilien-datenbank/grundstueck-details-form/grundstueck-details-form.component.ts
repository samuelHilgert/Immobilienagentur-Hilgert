import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../../../../shared/material-imports';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grundstueck-details-form',
  standalone:true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './grundstueck-details-form.component.html',
  styleUrl: './grundstueck-details-form.component.scss'
})
export class GrundstueckDetailsFormComponent {

}
