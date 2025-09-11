import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../shared/material-imports';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faComments, 
  faCalculator, 
  faCamera, 
  faHandshake,
  faKey,
  faLongArrowAltRight
} from '@fortawesome/free-solid-svg-icons';

interface ServiceItem {
  icon: any;
  title: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-work-presentation',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, FontAwesomeModule],
  templateUrl: './work-presentation.component.html',
  styleUrl: './work-presentation.component.scss'
})

export class WorkPresentationComponent {
  // Icons für die Services
  faComments = faComments;
  faCalculator = faCalculator;
  faCamera = faCamera;
  faHandshake = faHandshake;
  faKey = faKey;

  // Pfeil Icons
  faArrowRight = faLongArrowAltRight; 
}