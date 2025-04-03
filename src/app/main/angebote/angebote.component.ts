import {
  Component,
  OnInit,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';
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
  imports: [
    MATERIAL_MODULES,
    RouterLink,
    MatProgressSpinnerModule,
    CommonModule,
  ],
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
  currentIndex: number = 0;
  cardWidth: number = 420; // Karte + margin

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
      next: async (data) => {
        const alleImmobilien: Immobilie[] = data || [];
  
        this.immobilien = alleImmobilien.filter(
          (immo) =>
            immo.propertyStatus === 'Angebot' &&
            immo.uploadPublicTargets?.homepage === true
        );
  
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
  
        if (this.immobilien.length > 1) {
          const first = this.immobilien[0];
          const last = this.immobilien[this.immobilien.length - 1];
          this.immobilien = [last, ...this.immobilien, first];
          this.currentIndex = 1;
          this.updateSlidePosition(true);
        }
  
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

  ngAfterViewInit(): void {
    setTimeout(() => this.calculateSliderDimensions(), 250);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.calculateSliderDimensions();
    this.updateSlidePosition();
  }

  calculateSliderDimensions(): void {
    const sliderElement =
      this.elementRef.nativeElement.querySelector('.angebote-slider');
    if (sliderElement) {
      this.sliderWidth = sliderElement.offsetWidth;
      this.updateSlidePosition();
    }
  }

  updateSlidePosition(noAnimation: boolean = false): void {
    const grid = this.elementRef.nativeElement.querySelector('.angebote-grid');
    if (grid) {
      grid.style.transition = noAnimation
        ? 'none'
        : 'transform 0.5s ease-in-out';
    }

    this.slidePosition = -1 * this.currentIndex * this.cardWidth;
  }

  prevPage(): void {
    this.currentIndex--;
    this.updateSlidePosition();

    if (this.currentIndex === 0) {
      setTimeout(() => {
        this.currentIndex = this.immobilien.length - 2;
        this.updateSlidePosition(true);
      }, 500);
    }
  }

  nextPage(): void {
    this.currentIndex++;
    this.updateSlidePosition();

    if (this.currentIndex === this.immobilien.length - 1) {
      setTimeout(() => {
        this.currentIndex = 1;
        this.updateSlidePosition(true); // instant ohne Animation
      }, 500);
    }
  }

  getMediaForImmobilie(externalId: string | undefined): MediaAttachment[] {
    if (!externalId) return [];
    return this.mediaAttachments[externalId] || [];
  }
}
