import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { ContactContentComponent } from '../../shared/contact-content/contact-content.component';

@Component({
  selector: 'app-kontakt-section',
  standalone: true,
  imports: [MATERIAL_MODULES, ContactContentComponent],  
  templateUrl: './kontakt-section.component.html',
  styleUrl: './kontakt-section.component.scss'
})

export class KontaktSectionComponent {

}
