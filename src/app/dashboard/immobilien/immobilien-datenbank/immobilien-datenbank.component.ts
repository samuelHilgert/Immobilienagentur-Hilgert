import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../../../shared/material-imports';
import { ImmobilienService } from '../../../services/immobilien.service';
import { Immobilie } from '../../../models/immobilie.model';
import { MediaAttachment } from '../../../models/media.model';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MediaService } from '../../../services/media.service';

@Component({
  selector: 'app-immobilien-datenbank',
  standalone:true,
  imports: [CommonModule, MATERIAL_MODULES, RouterOutlet],
  templateUrl: './immobilien-datenbank.component.html',
  styleUrl: './immobilien-datenbank.component.scss'
})

export class ImmobilienDatenbankComponent {
  immobilien: Immobilie[] = [];
  mediaAttachments: { [key: string]: MediaAttachment[] } = {};
  hoveredRow: string | null = null;
  titleImages: { [key: string]: MediaAttachment | null } = {};

  constructor(
    private immobilienService: ImmobilienService, 
    private router: Router,
    private mediaService: MediaService,
    private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
      this.immobilienService.getImmobilien().subscribe({
        next: async (data) => {
          // Sortieren nach indexId absteigend
          this.immobilien = [...(data || [])].sort((a, b) => (b.indexId ?? 0) - (a.indexId ?? 0));
    
          const promises = this.immobilien.map(async (immo) => {
            if (immo.externalId) {
              const titleImage = await this.mediaService.getTitleImageForProperty(immo.externalId);
              this.mediaAttachments[immo.externalId] = titleImage ? [titleImage] : [];
            }
          });          
    
          await Promise.all(promises);
        },
      });
    }    

  getMediaForImmobilie(externalId: string | undefined): MediaAttachment[] {
    if (!externalId) return [];
    return this.mediaAttachments[externalId] || [];
  }

  navigateToDetails(externalId: string) {
    const selected = this.immobilien.find(immo => immo.externalId === externalId);
    if (!selected) return;
  
    const type = selected.propertyType?.toLowerCase(); // z. B. "wohnung"
  
    if (['wohnung', 'haus', 'grundstueck'].includes(type)) {
      this.router.navigate([`/dashboard/immobilien/${type}-details-form`, externalId]);
    } else {
      console.warn('Unbekannter Immobilientyp:', selected.propertyType);
    }
  }
  
  getTitleImage(externalId: string): MediaAttachment | null {
    return this.titleImages[externalId] ?? null;
  }
  
}