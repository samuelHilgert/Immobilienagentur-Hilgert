import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../services/feedback.service';
import { Feedback } from '../../models/feedback.model';

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
  allReviews: Review[] = [];
  activeIndexes = [0, 1];
  activeReviews: Review[] = [];
  fading = [false, false];
  wasJustUpdated = [false, false];
  isHovered = [false, false];

  private toggle = 0;
  private intervalId: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private feedbackService: FeedbackService
  ) {}

  async ngOnInit(): Promise<void> {
    const feedbacks = await this.feedbackService.getFeedback();
  
    this.allReviews = feedbacks.map(f => ({
      name: (() => {
        const parts = (f.autorName || 'Anonym').trim().split(' ');
        return parts.length > 1
          ? `${parts[0].charAt(0)}. ${parts.slice(1).join(' ')}`
          : parts[0];
      })(),
      date: (f.creationDate instanceof Date ? f.creationDate : f.creationDate?.toDate?.())?.toLocaleDateString('de-DE') ?? 'Datum unbekannt',
      stars: f.rating,
      text: f.text
    }));
    
    if (this.allReviews.length < 2) return;
  
    this.activeReviews = [
      this.allReviews[this.activeIndexes[0]],
      this.allReviews[this.activeIndexes[1]]
    ];
  
    this.cdr.detectChanges(); // 👈 sofort rendern
  
    // erst jetzt den Intervall starten
    this.intervalId = setInterval(() => this.updateReview(), 4000);
  }
  

  updateReview(): void {
    const i = this.toggle;
    if (this.isHovered[i]) {
      this.toggle = 1 - i;
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
