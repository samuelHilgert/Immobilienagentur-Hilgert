import { Component } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MATERIAL_MODULES } from '../shared/material-imports';
import { CommonModule } from '@angular/common';
import { Immobilie } from '../models/immobilie.model';
import { MediaAttachment } from '../models/media.model';
import { ImmobilienService } from '../services/immobilien.service';
import { PaginationService } from '../services/pagination.service';
import { MatDialog } from '@angular/material/dialog';
import { MediaService } from '../services/media.service';
import { ImmobilienDetailsComponent } from '../shared/immobilien-details/immobilien-details.component';

@Component({
  selector: 'app-all-properties',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, MatProgressSpinner],
  templateUrl: './all-properties.component.html',
  styleUrl: './all-properties.component.scss'
})
export class AllPropertiesComponent {
  immobilien: Immobilie[] = [];
  mediaAttachments: { [key: string]: MediaAttachment[] } = {};
  errorMessage: string | null = null;
  expandedCards: { [key: string]: boolean } = {};
  private overlayTimeouts: { [key: string]: any } = {};
  isLoading: boolean = false;
  loadStatus: number = 0;

  constructor(
    private immobilienService: ImmobilienService,
    private dialog: MatDialog,
    private paginationService: PaginationService<Immobilie>,
    private mediaService: MediaService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadStatus = 0;

    this.immobilienService.getImmobilien().subscribe({
      next: async (data) => {
        this.immobilien = (data || [])
          .filter(
            (immo: Immobilie) =>
              immo.uploadPublicTargets?.homepage === true &&
              ['Angebot', 'Referenz', 'Reserviert'].includes(
                immo.propertyStatus
              )
          )
          .sort((a: Immobilie, b: Immobilie) => {
            // Zuerst nach propertyStatus
            if (
              a.propertyStatus === 'Angebot' &&
              b.propertyStatus !== 'Angebot'
            )
              return -1;
            if (
              a.propertyStatus !== 'Angebot' &&
              b.propertyStatus === 'Angebot'
            )
              return 1;

            // Danach nach indexId (numerisch absteigend)
            return (b.indexId || 0) - (a.indexId || 0);
          });

        this.paginationService.setData(this.immobilien, 8);

        const mediaPromises = this.immobilien.map((immobilie) => {
          return this.mediaService
            .getMediaForProperty(immobilie.externalId!)
            .then((mediaList) => {
              const titleImage = mediaList.find((m) => m.isTitleImage);
              const fallbackImage = mediaList[0]; // falls kein Titelbild gesetzt ist
              const imageToUse = titleImage || fallbackImage;

              if (imageToUse) {
                this.mediaAttachments[immobilie.externalId!] = [imageToUse];
              }
            });
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

    if (
      (immobilie.propertyStatus === 'Referenz' ||
        immobilie.propertyStatus === 'Reserviert') &&
      id
    ) {
      if (this.overlayTimeouts[id]) {
        clearTimeout(this.overlayTimeouts[id]);
      }

      this.expandedCards[id] = true;

      this.overlayTimeouts[id] = setTimeout(() => {
        this.expandedCards[id] = false;
        delete this.overlayTimeouts[id];
      }, 2000);
    }

    if (immobilie.propertyStatus === 'Angebot') {
      this.openImmobilienDetails(immobilie);
    }
  }

  openImmobilienDetails(immobilie: Immobilie): void {
    const media = this.mediaAttachments[immobilie.externalId!];

    this.dialog.open(ImmobilienDetailsComponent, {
      panelClass: 'details-dialog',
      data: {
        immobilie,
        media,
      },
      autoFocus: false,
    });
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
