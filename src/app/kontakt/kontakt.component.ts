import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../shared/material-imports';
import { KontaktContentComponent } from '../shared/kontakt-content/kontakt-content.component';

@Component({
  selector: 'app-kontakt',
  standalone: true,
  imports: [MATERIAL_MODULES, KontaktContentComponent],  
  templateUrl: './kontakt.component.html',
  styleUrl: './kontakt.component.scss'
})

export class KontaktComponent {

}
