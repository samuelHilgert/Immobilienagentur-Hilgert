import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../material-imports';
import { Feedback } from '../../models/feedback.model';
import { FeedbackService } from '../../services/feedback.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bewerten',
  standalone: true,
  imports: [MATERIAL_MODULES, NgIf, FormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss'
})

export class BewertenComponent {
  feedback: Feedback = {
    bewertungId: '',
    publicAccepted: false,
    text: '',
    rating: 5,
    autorName: '',
    autorEmail: '',
    creationDate: new Date()
  };
  hoverRating = 0;

  successMessage = '';
  errorMessage = '';

  constructor(private FeedbackService: FeedbackService) {}

  async submitBewertung(): Promise<void> {
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const result = await this.FeedbackService.saveBewertung(this.feedback);
      if (result.success) {
        this.successMessage = 'Vielen Dank für Ihre Bewertung!';
        this.feedback = {
          bewertungId: '',
          publicAccepted: false,
          text: '',
          rating: 5,
          autorName: '',
          autorEmail: '',
          creationDate: new Date()
        };
      } else {
        this.errorMessage = 'Fehler beim Speichern.';
      }
    } catch (error) {
      console.error('Fehler:', error);
      this.errorMessage = 'Ein Fehler ist aufgetreten.';
    }
  }

  setRating(star: number) {
    this.feedback.rating = star;
  }

}
