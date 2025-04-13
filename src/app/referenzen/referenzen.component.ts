import { Component, ElementRef, OnInit } from '@angular/core';
import { ImmobilienService } from '../services/immobilien.service';
import { Immobilie } from '../models/immobilie.model';
import { MediaAttachment } from '../models/media.model';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../shared/material-imports';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PaginationService } from '../services/pagination.service';

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

        // 🔽 Sortieren nach externalId (absteigend)
        this.immobilien.sort((a, b) => {
          const idA = parseInt(a.externalId || '0', 10);
          const idB = parseInt(b.externalId || '0', 10);
          return idB - idA;
        });

        this.paginationService.setData(this.immobilien, 8);

        const mediaPromises = this.immobilien.map((immobilie) => {
          if (
            immobilie.externalId &&
            !this.mediaAttachments[immobilie.externalId]
          ) {
            return new Promise<void>((resolve) => {
              this.immobilienService
                .getMediaByExternalId(immobilie.externalId!)
                .subscribe({
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
