import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MATERIAL_MODULES } from '../../shared/material-imports';

@Component({
  selector: 'app-agb',
  standalone:true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './agb.component.html',
  styleUrl: './agb.component.scss'
})
export class AgbComponent {
  constructor(private dialogRef: MatDialogRef<AgbComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
}
