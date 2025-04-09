import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MATERIAL_MODULES } from '../../material-imports';
import { DatenschutzComponent } from '../../../impressum/datenschutz/datenschutz.component';

@Component({
  selector: 'app-feedback-payment-conditions',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './feedback-payment-conditions.component.html',
  styleUrl: './feedback-payment-conditions.component.scss',
})
export class FeedbackPaymentConditionsComponent {
  constructor(
    private dialogRef: MatDialogRef<FeedbackPaymentConditionsComponent>,
    private dialog: MatDialog
  ) {}

  openDatenschutz(): void {
    this.dialog.open(DatenschutzComponent, {
      panelClass: 'details-dialog',
      width: '600px',
      autoFocus: false,
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
