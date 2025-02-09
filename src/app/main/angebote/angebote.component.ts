import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-angebote',
  standalone: true,
  imports: [MATERIAL_MODULES],
  templateUrl: './angebote.component.html',
  styleUrl: './angebote.component.scss',
})
export class AngeboteComponent {
  isLoading: boolean = false;
  loadStatus: number = 0;

  loadData() {
    this.isLoading = true;
    this.loadStatus = 10;

    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
  }
}
