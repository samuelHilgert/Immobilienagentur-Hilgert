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
export class AngeboteComponent implements OnInit { // ✅ Implementiert OnInit
  immobilien: Immobilie[] = []; 
  isLoading: boolean = false;

  constructor(private immobilienService: ImmobilienService) {}

  ngOnInit(): void {
    this.isLoading = true; // Lade-Status aktivieren

    this.immobilienService.getImmobilien().subscribe({
      next: (data) => { // ✅ **Verwende next statt direkt data**
        console.log('Empfangene Daten:', data);
        
        if (data && data.immobilien) {
          this.immobilien = data.immobilien; // ✅ Korrekte Zuweisung
        } else {
          console.warn('Keine Immobilien-Daten erhalten!');
        }

        this.isLoading = false;
      },
      error: (error) => { // ✅ **Besseres Fehlerhandling**
        console.error('Fehler beim Laden der Immobilien:', error);
        this.isLoading = false;
      }
    });
  }
}
