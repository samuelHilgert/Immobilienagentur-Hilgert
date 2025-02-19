import { Component, OnInit } from '@angular/core';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ImmobilienService } from '../../services/immobilien.service';
import { Immobilie } from '../../models/immobilie.model';

@Component({
  selector: 'app-angebote',
  standalone: true,
  imports: [MATERIAL_MODULES],
  templateUrl: './angebote.component.html',
  styleUrl: './angebote.component.scss',
})
export class AngeboteComponent implements OnInit {
  // ✅ Implementiert OnInit
  immobilien: Immobilie[] = [];
  isLoading: boolean = false;
  loadStatus: number = 0;
  errorMessage: string | null = null;
  
  constructor(private immobilienService: ImmobilienService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadStatus = 0;
    
  
    // Simulierter Fortschritt, max. 90%, damit 100% erst mit echten Daten erreicht wird
    const interval = setInterval(() => {
      if (this.loadStatus < 90) {
        this.loadStatus += 10;
      }
    }, 500); // Update alle 500ms für flüssigere Animation
  
    this.immobilienService.getImmobilien().subscribe(
      (data) => {
        this.immobilien = data.immobilien as Immobilie[];
        console.log('Immobilien: ', this.immobilien);
        this.isLoading = false;
        this.loadStatus = 100; // Setze auf 100%, wenn fertig
        clearInterval(interval);
      },
      (error) => {
        console.error('Fehler beim Laden der Immobilien:', error);
        this.isLoading = false;
        this.loadStatus = 0; // Setze zurück, wenn Fehler auftritt
        clearInterval(interval);
      }
    );
  }
  
}
