import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MATERIAL_MODULES } from '../../material-imports';

@Component({
  selector: 'app-feedback-payment-conditions',
  standalone:true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './feedback-payment-conditions.component.html',
  styleUrl: './feedback-payment-conditions.component.scss'
})
export class FeedbackPaymentConditionsComponent {
  constructor(private dialogRef: MatDialogRef<FeedbackPaymentConditionsComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
}
