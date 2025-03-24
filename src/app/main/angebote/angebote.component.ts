import { Component, OnInit, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImmobilienService } from '../../services/immobilien.service';
import { Immobilie } from '../../models/immobilie.model';
import { MediaAttachment } from '../../models/media.model';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-angebote',
  standalone: true,
  imports: [MATERIAL_MODULES, RouterLink, MatProgressSpinnerModule, CommonModule],
  templateUrl: './angebote.component.html',
  styleUrl: './angebote.component.scss',
})
export class AngeboteComponent implements OnInit, AfterViewInit {
  immobilien: Immobilie[] = [];
  isLoading: boolean = false;
  loadStatus: number = 0;
  errorMessage: string | null = null;
  mediaAttachments: { [key: string]: MediaAttachment[] } = {};

  // Für den Slider
  currentPage: number = 0;
  totalPages: number = 0;
  slidePosition: number = 0;
  sliderWidth: number = 0;

  constructor(
    private immobilienService: ImmobilienService,
    private elementRef: ElementRef
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
      next: (data) => {
        const alleImmobilien: Immobilie[] = data || [];

        console.log('alleImmobilien: ',alleImmobilien);
        // Nur Angebote anzeigen
        this.immobilien = alleImmobilien.filter(immo => immo.propertyStatus === 'Angebot');
        this.totalPages = Math.ceil(this.immobilien.length / 2); // Zwei pro Seite

        // Medien laden
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

  ngAfterViewInit(): void {
    setTimeout(() => this.calculateSliderDimensions(), 250);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.calculateSliderDimensions();
    this.updateSlidePosition();
  }

  calculateSliderDimensions(): void {
    const sliderElement = this.elementRef.nativeElement.querySelector('.angebote-slider');
    if (sliderElement) {
      this.sliderWidth = sliderElement.offsetWidth;
      this.updateSlidePosition();
    }
  }

  updateSlidePosition(): void {
    this.slidePosition = -1 * this.currentPage * this.sliderWidth;
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    } else {
      this.currentPage = this.totalPages - 1;
    }
    this.updateSlidePosition();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    } else {
      this.currentPage = 0;
    }
    this.updateSlidePosition();
  }

  loadMedia(externalId: string) {
    this.immobilienService.getMediaByExternalId(externalId)
      .subscribe({
        next: (media) => {
          this.mediaAttachments[externalId] = media;
        },
        error: (error) => {
          console.error(`Fehler beim Laden der Medien für ${externalId}:`, error);
        }
      });
  }

  getMediaForImmobilie(externalId: string | undefined): MediaAttachment[] {
    if (!externalId) return [];
    return this.mediaAttachments[externalId] || [];
  }
}
