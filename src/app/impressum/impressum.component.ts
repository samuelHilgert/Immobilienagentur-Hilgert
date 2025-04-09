import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../shared/material-imports';
import { RouterLink } from '@angular/router';
import { AgbComponent } from './agb/agb.component';
import { WiderrufComponent } from './widerruf/widerruf.component';
import { CommonModule } from '@angular/common';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './impressum.component.html',
  styleUrl: './impressum.component.scss',
})
export class ImpressumComponent {

  constructor(
    private dialog: MatDialog,
  ) {}
  
  openWiderruf(): void {
    this.dialog.open(WiderrufComponent, {
      panelClass: 'details-dialog',
      width: '600px',
      autoFocus: false
    });
  }

  openAGB(): void {
    this.dialog.open(AgbComponent, {
      panelClass: 'details-dialog',
      width: '600px',
      autoFocus: false 
    });
  }

  openDatenschutz(): void {
    this.dialog.open(DatenschutzComponent, {
      panelClass: 'details-dialog',
      width: '600px',
      autoFocus: false 
    });
  }

}
