import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ca-contact',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './ca-contact.component.html',
  styleUrl: './ca-contact.component.scss'
})

export class CaContactComponent {

    // do not allows rightclick on images
    disableContextMenu(event: MouseEvent): void {
      event.preventDefault();
    }
}
