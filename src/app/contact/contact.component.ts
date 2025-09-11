import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../shared/material-imports';
import { ContactContentComponent } from '../shared/contact-content/contact-content.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [MATERIAL_MODULES, ContactContentComponent],  
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})

export class ContactComponent {

}
