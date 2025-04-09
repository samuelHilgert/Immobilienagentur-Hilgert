import { Component, Input, SimpleChanges } from '@angular/core';
import { MATERIAL_MODULES } from '../material-imports';
import { Feedback } from '../../models/feedback.model';
import { FeedbackService } from '../../services/feedback.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackForCashComponent } from './feedback-for-cash/feedback-for-cash.component';
import { SuccessMsgDialogComponent } from '../success-msg-dialog/success-msg-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-bewerten',
  standalone: true,
  imports: [MATERIAL_MODULES, NgIf, FormsModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
})
export class BewertenComponent {
  @Input() bonus: string[] = [];
  @Input() feedbackPaymentConditionAccepted: boolean = false;
  @Input() feedbackAdvertiseAccepted: boolean = false;

  feedback: Feedback = {
    bewertungId: '',
    publicAccepted: false,
    text: '',
    rating: 5,
    autorName: '',
    autorEmail: '',
    bonus: [],
    feedbackPaymentConditionAccepted: false,
    feedbackAdvertiseAccepted: false,
    creationDate: new Date(),
  };
  hoverRating = 0;

  successMessage = '';
  errorMessage = '';

  constructor(
    private FeedbackService: FeedbackService,
    private dialog: MatDialog
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bonus']) {
      this.feedback.bonus = this.bonus;
    }
    if (changes['feedbackPaymentConditionAccepted']) {
      this.feedback.feedbackPaymentConditionAccepted =
        this.feedbackPaymentConditionAccepted;
    }
    if (changes['feedbackAdvertiseAccepted']) {
      this.feedback.feedbackAdvertiseAccepted = this.feedbackAdvertiseAccepted;
    }
  }

  async submitBewertung(): Promise<void> {
    this.successMessage = '';
    this.errorMessage = '';

    try {
      const result = await this.FeedbackService.saveBewertung(this.feedback);
      if (result.success) {
        this.successMessage = 'Vielen Dank für Ihre Bewertung!';

        // ✅ Öffne Success-Dialog
        this.dialog.open(SuccessMsgDialogComponent, {
          width: '400px',
          autoFocus: false,
          disableClose: true,
        });

        // Optional: Feedback zurücksetzen
        this.feedback = {
          bewertungId: '',
          text: '',
          rating: 5,
          autorName: '',
          autorEmail: '',
          bonus: [],
          publicAccepted: false,
          feedbackPaymentConditionAccepted: false,
          feedbackAdvertiseAccepted: false,
          creationDate: new Date(),
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
