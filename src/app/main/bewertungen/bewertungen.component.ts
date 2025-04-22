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
  activeReviews: Review[] = [null!, null!]; // zwei Slots
  fading = [false, false];
  isHovered = [false, false];
  private currentIndexes = [0, 1]; // aktueller Index pro Slot
  private nextIndexes = [2, 3]; // vorbereiteter Index pro Slot
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
      date: f.creationDate ? new Date(f.creationDate).toLocaleDateString('de-DE') : 'Datum unbekannt',
      stars: f.rating,
      text: f.text
    }));

    if (this.allReviews.length < 2) return;

    this.activeReviews[0] = this.allReviews[this.currentIndexes[0]];
    this.activeReviews[1] = this.allReviews[this.currentIndexes[1]];

    this.cdr.detectChanges();

    this.intervalId = setInterval(() => this.updateReview(), 4000);
  }

  updateReview(): void {
    const i = this.toggle;

    if (this.isHovered[i]) {
      this.toggle = 1 - i;
      return;
    }

    this.fading[i] = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      const next = this.nextIndexes[i] % this.allReviews.length;

      this.activeReviews[i] = this.allReviews[next];
      this.currentIndexes[i] = next;

      // vorbereiten für nächsten Durchlauf
      this.nextIndexes[i] = (this.currentIndexes[i] + 2) % this.allReviews.length;

      this.fading[i] = false;
      this.cdr.detectChanges();

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
