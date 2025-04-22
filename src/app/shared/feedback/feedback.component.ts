import { Component, Input, SimpleChanges } from '@angular/core';
import { MATERIAL_MODULES } from '../material-imports';
import { FeedbackService } from '../../services/feedback.service';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
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

  feedbackForm: FormGroup;
  hoverRating = 0;
  successMessage = '';
  errorMessage = '';

  constructor(
    private feedbackService: FeedbackService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.feedbackForm = this.fb.group({
      publicAccepted: [false, Validators.requiredTrue],
      text: ['', [Validators.required]],
      rating: [5, Validators.required],
      autorName: ['', [Validators.required, Validators.minLength(3)]],
      autorEmail: ['', [Validators.required, Validators.email]],
      bonus: [[]],
      feedbackPaymentConditionAccepted: [false, Validators.requiredTrue],
      feedbackAdvertiseAccepted: [false, Validators.requiredTrue],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bonus']) {
      this.feedbackForm.patchValue({ bonus: this.bonus });
    }
    if (changes['feedbackPaymentConditionAccepted']) {
      this.feedbackForm.patchValue({
        feedbackPaymentConditionAccepted: this.feedbackPaymentConditionAccepted,
      });
    }
    if (changes['feedbackAdvertiseAccepted']) {
      this.feedbackForm.patchValue({
        feedbackAdvertiseAccepted: this.feedbackAdvertiseAccepted,
      });
    }
  }

  async submitBewertung(): Promise<void> {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.feedbackForm.invalid) {
      this.errorMessage = 'Bitte füllen Sie alle Pflichtfelder korrekt aus.';
      return;
    }

    try {
      const feedback = this.feedbackForm.value;

      const result = await this.feedbackService.saveBewertung(feedback);
      if (result.success) {
        this.successMessage = 'Vielen Dank für Ihre Bewertung!';

        this.dialog.open(SuccessMsgDialogComponent, {
          width: '400px',
          autoFocus: false,
          disableClose: true,
        });

        this.feedbackForm.reset({
          publicAccepted: false,
          text: '',
          rating: 5,
          autorName: '',
          autorEmail: '',
          bonus: [],
          feedbackPaymentConditionAccepted: false,
          feedbackAdvertiseAccepted: false,
        });
      } else {
        this.errorMessage = 'Fehler beim Speichern.';
      }
    } catch (error) {
      console.error('Fehler:', error);
      this.errorMessage = 'Ein Fehler ist aufgetreten.';
    }
  }

  setRating(star: number) {
    this.feedbackForm.patchValue({ rating: star });
  }
}
