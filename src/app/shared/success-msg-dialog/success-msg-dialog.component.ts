import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MATERIAL_MODULES } from '../material-imports';

@Component({
  selector: 'app-success-msg-dialog',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './success-msg-dialog.component.html',
  styleUrl: './success-msg-dialog.component.scss'
})
export class SuccessMsgDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<SuccessMsgDialogComponent>) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.close();
    }, 5000);
  }

  close(): void {
    this.dialogRef.close();
  }
}
