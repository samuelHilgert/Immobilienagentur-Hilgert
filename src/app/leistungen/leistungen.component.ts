// leistungen.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../shared/material-imports';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faComments, 
  faCalculator, 
  faPaintBrush, 
  faChartLine,
  faLongArrowAltRight
} from '@fortawesome/free-solid-svg-icons';

interface ServiceItem {
  icon: any;
  title: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-leistungen',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, FontAwesomeModule],
  templateUrl: './leistungen.component.html',
  styleUrl: './leistungen.component.scss'
})
export class LeistungenComponent {
  // Icons für die Services
  faComments = faComments;
  faCalculator = faCalculator;
  faPaintBrush = faPaintBrush;
  faChartLine = faChartLine;
  
  // Pfeil Icons
  faArrowRight = faLongArrowAltRight; 

  services: ServiceItem[] = [
    {
      icon: this.faComments,
      title: 'Webentwicklung',
      description: 'Moderne, responsive Websites und Webanwendungen mit den neuesten Technologien.',
      link: '#'
    },
    {
      icon: this.faCalculator,
      title: 'App-Entwicklung',
      description: 'Native und hybride Apps für iOS und Android, die Ihre Nutzer begeistern werden.',
      link: '#'
    },
    {
      icon: this.faPaintBrush,
      title: 'UI/UX Design',
      description: 'Benutzerfreundliche und ansprechende Designs, die Ihre Marke perfekt repräsentieren.',
      link: '#'
    },
    {
      icon: this.faChartLine,
      title: 'SEO & Marketing',
      description: 'Optimierung Ihrer Online-Präsenz für mehr Sichtbarkeit und höheren Umsatz.',
      link: '#'
    }
  ];
}