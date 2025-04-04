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
    // Markerposition berechnen (0–250 kWh → 0–100%)
    if (this.energyValue === null || this.energyValue < 0) {
      this.aktuelleMarkerPosition = 0;
    } else if (this.energyValue > 250) {
      this.aktuelleMarkerPosition = 100;
    } else {
      this.aktuelleMarkerPosition = (this.energyValue / 250) * 100;
    }
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
