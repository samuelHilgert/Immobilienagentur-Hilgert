import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-widerruf',
  standalone:true,
  imports: [],
  templateUrl: './widerruf.component.html',
  styleUrl: './widerruf.component.scss'
})
export class WiderrufComponent {
  constructor(public dialogRef: MatDialogRef<WiderrufComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
  
}
