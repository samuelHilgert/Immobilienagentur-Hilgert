import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../shared/material-imports';
import { ContactContentComponent } from '../shared/contact-content/contact-content.component';

@Component({
  selector: 'app-kontakt',
  standalone: true,
  imports: [MATERIAL_MODULES, ContactContentComponent],  
  templateUrl: './kontakt.component.html',
  styleUrl: './kontakt.component.scss'
})

export class KontaktComponent {

}
