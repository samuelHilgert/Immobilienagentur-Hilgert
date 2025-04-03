import { Component, OnInit } from '@angular/core';
import { ImmobilienService } from '../services/immobilien.service';
import { Immobilie } from '../models/immobilie.model';
import { MediaAttachment } from '../models/media.model';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../shared/material-imports';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-alle-immobilien',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, MatProgressSpinner],
  templateUrl: './alle-immobilien.component.html',
  styleUrl: './alle-immobilien.component.scss',
})
export class AlleImmobilienComponent implements OnInit {
  immobilien: Immobilie[] = [];
  mediaAttachments: { [key: string]: MediaAttachment[] } = {};
  errorMessage: string | null = null;
  expandedCards: { [key: string]: boolean } = {};
  private overlayTimeouts: { [key: string]: any } = {};
  isLoading: boolean = false;
  loadStatus: number = 0;

  constructor(private immobilienService: ImmobilienService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadStatus = 0;
  
    this.immobilienService.getImmobilien().subscribe({
      next: async (data) => {
        this.immobilien = (data || [])
          .filter((immo: Immobilie) => immo.uploadPublicTargets?.homepage === true)
          .sort((a: Immobilie, b: Immobilie) => {
            if (a.propertyStatus === 'Angebot' && b.propertyStatus !== 'Angebot') return -1;
            if (a.propertyStatus !== 'Angebot' && b.propertyStatus === 'Angebot') return 1;
            return 0;
          });
  
        const mediaPromises = this.immobilien.map((immobilie) => {
          if (immobilie.externalId && !this.mediaAttachments[immobilie.externalId]) {
            return new Promise<void>((resolve) => {
              this.immobilienService.getMediaByExternalId(immobilie.externalId!).subscribe({
                next: (media) => {
                  this.mediaAttachments[immobilie.externalId!] = media;
                  resolve();
                },
                error: () => resolve(),
              });
            });
          }
          return Promise.resolve();
        });
  
        await Promise.all(mediaPromises);
  
        this.isLoading = false; // 👈 Spinner hier beenden!
      },
      error: (err) => {
        console.error('Fehler beim Laden der Immobilien', err);
        this.errorMessage = 'Fehler beim Laden der Immobilien';
        this.isLoading = false; // 👈 Auch im Fehlerfall beenden!
      },
    });
  }  

  getMediaForImmobilie(externalId: string | undefined): MediaAttachment[] {
    if (!externalId) return [];
    return this.mediaAttachments[externalId] || [];
  }

  toggleCard(immobilie: Immobilie): void {
    const id = immobilie.externalId;
    if (immobilie.propertyStatus === 'Referenz' && id) {
      // Falls ein Timeout läuft, abbrechen
      if (this.overlayTimeouts[id]) {
        clearTimeout(this.overlayTimeouts[id]);
      }
  
      // Overlay anzeigen
      this.expandedCards[id] = true;
  
      // Timeout setzen und merken
      this.overlayTimeouts[id] = setTimeout(() => {
        this.expandedCards[id] = false;
        delete this.overlayTimeouts[id];
      }, 2000);
    }
  }
  
  
}
