import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-datenschutz',
  standalone:true,
  imports: [],
  templateUrl: './datenschutz.component.html',
  styleUrl: './datenschutz.component.scss'
})
export class DatenschutzComponent {
  constructor(private dialogRef: MatDialogRef<DatenschutzComponent>) {}

  close(): void {
    this.dialogRef.close();
  }

  openLink(): void {
    window.open(
      'https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html',
      '_blank',
      'noopener,noreferrer'
    );
  }
}
