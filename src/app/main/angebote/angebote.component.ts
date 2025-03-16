import { Component, OnInit } from '@angular/core';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { MatProgressSpinnerModule, ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ImmobilienService } from '../../services/immobilien.service';
import { Immobilie } from '../../models/immobilie.model';
import { MediaAttachment } from '../../models/media.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-angebote',
  standalone: true,
  imports: [MATERIAL_MODULES, RouterLink, MatProgressSpinnerModule],
  templateUrl: './angebote.component.html',
  styleUrl: './angebote.component.scss',
})
export class AngeboteComponent implements OnInit {
  immobilien: Immobilie[] = [];
  isLoading: boolean = false;
  loadStatus: number = 0;
  errorMessage: string | null = null;
  mediaAttachments: { [key: string]: MediaAttachment[] } = {};

  constructor(private immobilienService: ImmobilienService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadStatus = 0;

    const interval = setInterval(() => {
      if (this.loadStatus < 90) {
        this.loadStatus += 10;
      }
    }, 500);

    this.immobilienService.getImmobilien().subscribe({
      next: (data) => {
        this.immobilien = data.immobilien;
        console.log('Immobilien: ', this.immobilien);
        
        this.immobilien.forEach(immobilie => {
          if (immobilie.externalId) {
            this.loadMedia(immobilie.externalId);
          }
        });

        this.isLoading = false;
        this.loadStatus = 100;
        clearInterval(interval);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Immobilien:', error);
        this.errorMessage = 'Fehler beim Laden der Immobilien';
        this.isLoading = false;
        this.loadStatus = 0;
        clearInterval(interval);
      }
    });
  }

  loadMedia(externalId: string) {
    this.immobilienService.getMediaByExternalId(externalId)
      .subscribe({
        next: (media) => {
          this.mediaAttachments[externalId] = media;
        },
        error: (error) => {
          console.error(`Fehler beim Laden der Medien für ${externalId}:`, error);
          // Entfernen Sie diese Zeile
          // this.mediaAttachments[externalId] = [];
        }
      });
  }

  getMediaForImmobilie(externalId: string | undefined): MediaAttachment[] {
    if (!externalId) {
      return [];
    }
    return this.mediaAttachments[externalId] || [];
  }
}