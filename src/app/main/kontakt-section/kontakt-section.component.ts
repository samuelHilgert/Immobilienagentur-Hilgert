import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { KontaktContentComponent } from '../../shared/kontakt-content/kontakt-content.component';

@Component({
  selector: 'app-kontakt-section',
  standalone: true,
  imports: [MATERIAL_MODULES, KontaktContentComponent],  
  templateUrl: './kontakt-section.component.html',
  styleUrl: './kontakt-section.component.scss'
})

export class KontaktSectionComponent {

}
