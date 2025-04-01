import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  styleUrls: ['./bewertungen.component.scss']
})
export class BewertungenComponent implements OnInit {
  allReviews: Review[] = [
    {
      name: 'T. Backhaus',
      date: '21.03.2025',
      stars: 5,
      text: 'Anfangs war ich skeptisch, weil es hieß, das die Beratung und Bewertung kostenfrei und unverbindlich seien. Das waren sie dann auch und Herr Hilgert hat sich sehr viel Mühe gegeben mich ausführlich und verständlich aufzuklären. Er ging dabei auch sehr sachlich und transparent vor. Die Vermittlung lief dabei auch reibungslos. Im Nachhinein stellte sich heraus, das die Vorgehensweise genau richtig war. Er hatte schon zu Beginn die Grundbuchangelegenheiten geklärt, da wir ohne diese später Probleme bei der Abwicklung bekommen hätten. Er wusste jederzeit, was zu tun war. Ich war sehr zufrieden mit seiner Arbeit und kann ihn jederzeit weiterempfehlen.'
    },
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
    }
  ];


  activeIndexes = [0, 1];
  activeReviews: Review[] = [];
  fading = [false, false];
  wasJustUpdated = [false, false];
  isHovered = [false, false];

  private toggle = 0;
  private intervalId: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.activeReviews = [
      this.allReviews[this.activeIndexes[0]],
      this.allReviews[this.activeIndexes[1]]
    ];

    this.intervalId = setInterval(() => this.updateReview(), 4000);
  }

  updateReview(): void {
    const i = this.toggle;
    if (this.isHovered[i]) {
      this.toggle = 1 - i; // versuche beim nächsten Tick die andere Seite
      return;
    }
  
    this.fading[i] = true;
    this.wasJustUpdated[i] = false;
    this.cdr.detectChanges();
  
    setTimeout(() => {
      const newIndex = (this.activeIndexes[i] + 2) % this.allReviews.length;
      this.activeIndexes[i] = newIndex;
  
      this.activeReviews = [...this.activeReviews];
      this.activeReviews[i] = this.allReviews[newIndex];
  
      this.fading[i] = false;
      this.wasJustUpdated[i] = true;
      this.cdr.detectChanges();
  
      setTimeout(() => {
        this.wasJustUpdated[i] = false;
        this.cdr.detectChanges();
      }, 400);
  
      this.toggle = 1 - i;
    }, 400);
  }
  

  pauseRotation(index: number): void {
    this.isHovered[index] = true;
  }
  
  resumeRotation(index: number): void {
    this.isHovered[index] = false;
  }
}
