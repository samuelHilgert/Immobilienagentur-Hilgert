import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MATERIAL_MODULES } from '../../material-imports';
import { BewertenComponent } from '../feedback.component';
import { FeedbackPaymentConditionsComponent } from '../../terms/feedback-payment-conditions/feedback-payment-conditions.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-feedback-for-cash',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, BewertenComponent],
  templateUrl: './feedback-for-cash.component.html',
  styleUrl: './feedback-for-cash.component.scss',
})
export class FeedbackForCashComponent {
  bonus: string[] = [];
  feedbackPaymentConditionAccepted: boolean = false;
  feedbackAdvertiseAccepted: boolean = false;

  constructor(
    private dialog: MatDialog,
  ) {}

  openPaymentConditions(): void {
    this.dialog.open(FeedbackPaymentConditionsComponent, {
      panelClass: 'details-dialog',
      width: '600px'
    });
  }

}
