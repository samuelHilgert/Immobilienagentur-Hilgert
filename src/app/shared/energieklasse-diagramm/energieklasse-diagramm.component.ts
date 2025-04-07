import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-energieklasse-diagramm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './energieklasse-diagramm.component.html',
  styleUrl: './energieklasse-diagramm.component.scss',
})
export class EnergieklasseDiagrammComponent implements OnChanges {
  @Input() energyValue: number | null = null;
  @Input() ausweistyp!: 'ENERGY_REQUIRED' | 'ENERGY_CONSUMPTION' | 'NO_INFORMATION';
  
  aktuelleMarkerPosition: number = 0;

  ngOnChanges(): void {
    if (this.energyValue === null || this.energyValue < 0) {
      this.aktuelleMarkerPosition = 0;
      return;
    }
  
    const stufen = [
      { klasse: 'A+', min: 0, max: 30 },
      { klasse: 'A', min: 30, max: 50 },
      { klasse: 'B', min: 50, max: 75 },
      { klasse: 'C', min: 75, max: 100 },
      { klasse: 'D', min: 100, max: 130 },
      { klasse: 'E', min: 130, max: 160 },
      { klasse: 'F', min: 160, max: 200 },
      { klasse: 'G', min: 200, max: 250 },
      { klasse: 'H', min: 250, max: Infinity },
    ];
  
    const gesamtBreite = 100; // in Prozent
    const segmentBreite = gesamtBreite / stufen.length;
  
    for (let i = 0; i < stufen.length; i++) {
      const { min, max } = stufen[i];
    
      // Letztes Segment (H): kein Faktor mehr nötig
      if (max === Infinity && this.energyValue >= min) {
        this.aktuelleMarkerPosition = (i + 0.5) * segmentBreite; // zentriert im letzten Segment
        return;
      }
    
      if (this.energyValue >= min && this.energyValue < max) {
        const faktor = (this.energyValue - min) / (max - min);
        this.aktuelleMarkerPosition = i * segmentBreite + faktor * segmentBreite;
        return;
      }
    }    
  
    // Wenn > 250
    this.aktuelleMarkerPosition = 100;
  }   

  get ausweisText(): string {
    switch (this.ausweistyp) {
      case 'ENERGY_REQUIRED':
        return 'Energiebedarfsausweis';
      case 'ENERGY_CONSUMPTION':
        return 'Energieverbrauchsausweis';
      default:
        return 'Energieausweis (keine Angabe)';
    }
  }

  get energiewert(): string {
    return this.energyValue !== null ? this.energyValue.toFixed(1) : '—';
  }

  get zeigerPosition(): number {
    return this.aktuelleMarkerPosition;
  }

  get markerPosition(): number {
    return this.aktuelleMarkerPosition;
  }

  energieklassen = [
    { label: 'A+', farbe: 'a-plus' },
    { label: 'A', farbe: 'a' },
    { label: 'B', farbe: 'b' },
    { label: 'C', farbe: 'c' },
    { label: 'D', farbe: 'd' },
    { label: 'E', farbe: 'e' },
    { label: 'F', farbe: 'f' },
    { label: 'G', farbe: 'g' },
  ];
}
