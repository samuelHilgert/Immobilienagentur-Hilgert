import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../shared/material-imports';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { WiderrufComponent } from './widerruf/widerruf.component';
import { AgbComponent } from './agb/agb.component';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss',
})

export class ImprintComponent {
  constructor(private dialog: MatDialog) {}

  openWiderruf(): void {
    this.dialog.open(WiderrufComponent, {
      panelClass: 'details-dialog',
      width: '600px',
      autoFocus: false,
    });
  }

  openAGB(): void {
    this.dialog.open(AgbComponent, {
      panelClass: 'details-dialog',
      width: '600px',
      autoFocus: false,
    });
  }

  openDatenschutz(): void {
    this.dialog.open(DatenschutzComponent, {
      panelClass: 'details-dialog',
      width: '600px',
      autoFocus: false,
    });
  }
}
