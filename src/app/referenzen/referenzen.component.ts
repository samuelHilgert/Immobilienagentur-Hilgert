import { Component, ElementRef, OnInit } from '@angular/core';
import { ImmobilienService } from '../services/immobilien.service';
import { Immobilie } from '../models/immobilie.model';
import { MediaAttachment } from '../models/media.model';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../shared/material-imports';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PaginationService } from '../services/pagination.service';
import { MediaService } from '../services/media.service';

@Component({
  selector: 'app-referenzen',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, MatProgressSpinner],
  templateUrl: './referenzen.component.html',
  styleUrl: './referenzen.component.scss',
})
export class ReferenzenComponent implements OnInit {
  immobilien: Immobilie[] = [];
  isLoading: boolean = false;
  loadStatus: number = 0;
  errorMessage: string | null = null;
  mediaAttachments: { [key: string]: MediaAttachment[] } = {};
  expandedCards: { [key: string]: boolean } = {};
  overlayTimeouts: { [key: string]: any } = {};

  constructor(
    private immobilienService: ImmobilienService,
    private elementRef: ElementRef,
    private mediaService: MediaService,
    private paginationService: PaginationService<Immobilie>
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadStatus = 0;

    const interval = setInterval(() => {
      if (this.loadStatus < 90) {
        this.loadStatus += 10;
      }
    }, 500);

    this.immobilienService.getImmobilien().subscribe({
      next: async (data) => {
        const alleImmobilien: Immobilie[] = data || [];

        this.immobilien = alleImmobilien.filter(
          (immo) =>
            immo.propertyStatus === 'Referenz' &&
            immo.uploadPublicTargets?.homepage === true
        );

        // sortiert Immobilien nach laufender Nummer indexId
        this.immobilien.sort((a, b) => {
          return (b.indexId || 0) - (a.indexId || 0);
        });

        this.paginationService.setData(this.immobilien, 8);

        // Bilder werden geladen
        const mediaPromises = this.immobilien.map((immobilie) => {
          return this.mediaService.getMediaForProperty(immobilie.externalId!).then((mediaList) => {
            const titleImage = mediaList.find((m) => m.isTitleImage);
            const fallbackImage = mediaList[0];
            const imageToUse = titleImage || fallbackImage;
        
            if (imageToUse) {
              this.mediaAttachments[immobilie.externalId!] = [imageToUse];
            }
          });
        });
             
        await Promise.all(mediaPromises);

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
      if (this.expandedCards[id]) {
        return;
      }

      this.expandedCards[id] = true;

      if (this.overlayTimeouts[id]) {
        clearTimeout(this.overlayTimeouts[id]);
      }

      this.overlayTimeouts[id] = setTimeout(() => {
        this.expandedCards[id] = false;
        delete this.overlayTimeouts[id];
      }, 2000);
    }
  }

  // Proxy-Getter fürs Template
  get paginatedImmobilien(): Immobilie[] {
    return this.paginationService.paginatedItems;
  }

  get totalPages(): number {
    return this.paginationService.totalPages;
  }

  get currentPage(): number {
    return this.paginationService.currentPage;
  }

  getRangeStart(): number {
    return this.paginationService.getRangeStart();
  }

  getRangeEnd(): number {
    return this.paginationService.getRangeEnd();
  }

  goToNextPage(): void {
    this.paginationService.goToNextPage();
  }

  goToPreviousPage(): void {
    this.paginationService.goToPreviousPage();
  }
}
