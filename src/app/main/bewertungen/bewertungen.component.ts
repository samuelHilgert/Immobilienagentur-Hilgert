import { Component, OnInit, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Review {
  name: string;
  date: string;
  stars: number;
  text: string;
}

@Component({
  selector: 'app-bewertungen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bewertungen.component.html',
  styleUrls: ['./bewertungen.component.scss'],
})
export class BewertungenComponent implements OnInit, AfterViewInit {
  // Alle Bewertungen
  allReviews: Review[] = [
    {
      name: 'V. Heinig',
      date: '17.03.2025',
      stars: 5,
      text: 'Wir hatten schon mit mehreren Maklern zu tun. Herr Hilgert hat uns am Ende überzeugt und wir können ihn wirklich weiter empfehlen er hat uns super betreut und war jederzeit erreichbar, wenn wir fragen hatten. Er war sehr ehrlich, sehr engagiert und hat viel mehr für uns getan, als wir von einem Maklern erwartet hatten. Wir waren mit dem gesamten Ablauf mehr als zufrieden. Dank ihm haben wir unsere Wohnung zum besten Preis verkauft.'
    },
    {
      name: 'S. Werle',
      date: '17.03.2025',
      stars: 5,
      text: 'Wir waren super betreut, danke.'
    },
    {
      name: 'K. Foitzik',
      date: '22.10.2022',
      stars: 5,
      text: 'Nur zu empfehlen!'
    },
    {
      name: 'J. Sulzer',
      date: '30.07.2022',
      stars: 5,
      text: 'Sehr seriös, professionell, sehr gut vorbereitet.'
    }
  ];
  
  // Bewertungen in Paaren organisieren
  reviewPairs: Review[][] = [];
  
  // Konfigurationsvariablen
  currentPage: number = 0;
  totalPages: number = 0;
  slidePosition: number = 0;
  sliderWidth: number = 0;
  
  constructor(private elementRef: ElementRef) {}
  
  ngOnInit(): void {
    // Bewertungen in Paare organisieren
    this.organizeReviewsInPairs();
    
    // Berechnung der Gesamtanzahl der Seiten basierend auf Paaren
    this.totalPages = this.reviewPairs.length;
  }
  
  // Organisiert die Bewertungen in Paaren (immer 2 nebeneinander)
  organizeReviewsInPairs(): void {
    this.reviewPairs = [];
    
    for (let i = 0; i < this.allReviews.length; i += 2) {
      const pair: Review[] = [];
      
      // Erstes Review des Paars
      pair.push(this.allReviews[i]);
      
      // Zweites Review des Paars (falls vorhanden)
      if (i + 1 < this.allReviews.length) {
        pair.push(this.allReviews[i + 1]);
      } else {
        // Falls ungerade Anzahl, fügen wir ein leeres Review hinzu, um das Layout zu erhalten
        pair.push({
          name: '',
          date: '',
          stars: 0,
          text: ''
        });
      }
      
      this.reviewPairs.push(pair);
    }
  }
  
  ngAfterViewInit(): void {
    // Initialisierung nach dem Rendern des DOM
    setTimeout(() => this.calculateSliderDimensions(), 250);
  }
  
  @HostListener('window:resize')
  onResize(): void {
    this.calculateSliderDimensions();
    this.updateSlidePosition();
  }
  
  // Berechnet die Dimensionen des Sliders
  calculateSliderDimensions(): void {
    const sliderElement = this.elementRef.nativeElement.querySelector('.review-slider');
    
    if (sliderElement) {
      this.sliderWidth = sliderElement.offsetWidth;
      this.updateSlidePosition();
    }
  }
  
  // Aktualisiert die Position des Sliders basierend auf der aktuellen Seite
  updateSlidePosition(): void {
    // Exakte Berechnung basierend auf der Containerbreite
    this.slidePosition = -1 * this.currentPage * this.sliderWidth;
  }
  
  // Zur vorherigen Seite wechseln mit Animation
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    } else {
      this.currentPage = this.totalPages - 1; // Zum Ende gehen
    }
    this.updateSlidePosition();
  }
  
  // Zur nächsten Seite wechseln mit Animation
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    } else {
      this.currentPage = 0; // Zum Anfang zurückkehren
    }
    this.updateSlidePosition();
  }
}