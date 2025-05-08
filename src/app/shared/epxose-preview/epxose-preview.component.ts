import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../material-imports';
import {
  GrundstueckDetails,
  HausDetails,
  Immobilie,
  WohnungDetails,
} from '../../models/immobilie.model';
import { ExposePreviewService } from '../../services/expose-preview.service';
import { ImmobilienService } from '../../services/immobilien.service';
import { MediaAttachment } from '../../models/media.model';
import {
  apartmentTypeLabels,
  buildingTypeLabels,
  Yes_No_Labels,
  True_False_Labels,
  conditionLabels,
  constructionPhaseLabels,
  interiorQualityLabels,
  heatingTypeLabels,
  firingTypeLabels,
  parkingSpaceTypeLabels,
  buildingEnergyRatingTypeLabels,
} from '../../utils/label-mappings.util';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Nl2brPipe } from '../pipes/nl2br.pipe';
import { EnergieklasseDiagrammComponent } from '../energieklasse-diagramm/energieklasse-diagramm.component';

@Component({
  selector: 'app-expose-preview',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, RouterModule, Nl2brPipe, EnergieklasseDiagrammComponent],
  templateUrl: './epxose-preview.component.html',
  styleUrl: './epxose-preview.component.scss',
})
export class EpxosePreviewComponent implements OnInit {
  immobilie: Immobilie | null = null;
  exposeLevel: 'normal' | 'gekürzt' | 'erweitert' = 'normal';
  media: MediaAttachment[] = [];
  wohnungDetails: WohnungDetails | null = null;
  hausDetails: HausDetails | null = null;
  grundstueckDetails: GrundstueckDetails | null = null;
  apartmentTypeLabels = apartmentTypeLabels;
  buildingTypeLabels = buildingTypeLabels;
  Yes_No_Labels = Yes_No_Labels;
  True_False_Labels = True_False_Labels;
  conditionLabels = conditionLabels;
  constructionPhaseLabels = constructionPhaseLabels;
  interiorQualityLabels = interiorQualityLabels;
  heatingTypeLabels = heatingTypeLabels;
  firingTypeLabels = firingTypeLabels;
  parkingSpaceTypeLabels = parkingSpaceTypeLabels;
  buildingEnergyRatingTypeLabels = buildingEnergyRatingTypeLabels;

  constructor(
    private route: ActivatedRoute,
    private exposePreviewService: ExposePreviewService,
    private immobilienService: ImmobilienService,
    private router: Router
  ) {}

  async ngOnInit() {
    const inquiryProcessId =
      this.route.snapshot.paramMap.get('inquiryProcessId');

    if (!inquiryProcessId || !inquiryProcessId.includes('_')) return;

    const [customerId, propertyExternalId] = inquiryProcessId.split('_');

    try {
      const [immobilie, preview] = await Promise.all([
        this.immobilienService.getProperty(propertyExternalId),
        this.exposePreviewService.getExposePreview(propertyExternalId),
      ]);

      this.media = immobilie.media || []; // wenn du media brauchst
      this.immobilie = immobilie;
      this.loadDetails();

      // 🔍 Zugriff prüfen
      if (preview.extendedExposeAccess?.includes(inquiryProcessId)) {
        this.exposeLevel = 'erweitert';
      } else if (preview.shortExposeAccess?.includes(inquiryProcessId)) {
        this.exposeLevel = 'gekürzt';
      } else {
        this.exposeLevel = 'normal';
      }

      console.log(' this.exposeLevel : ', this.exposeLevel);
    } catch (error) {
      console.error('Fehler beim Laden des Exposés:', error);
    }
  }

  async loadDetails(): Promise<void> {
    const id = this.immobilie?.externalId;
    const type = this.immobilie?.propertyType;
  
    if (!id) return;
  
    try {
      const fullData = await this.immobilienService.getProperty(id);
      
      if (type === 'Wohnung') {
        this.wohnungDetails = fullData.apartmentDetails;
      } else if (type === 'Haus') {
        this.hausDetails = fullData.houseDetails;
      } else if (type === 'Grundstück') {
        this.grundstueckDetails = fullData.landDetails;
      }
    } catch (error) {
      console.error('Fehler beim Laden der Detaildaten:', error);
    }
  }

  getLabel(map: Record<string, string>, key: string | null | undefined): string {
    if (!key) return 'Keine Angabe';
    return map[key] ?? 'Keine Angabe';
  }  

  get wohnung() {
    return (this.immobilie as any).apartmentDetails ?? null;
  }
  get haus() {
    return (this.immobilie as any).houseDetails ?? null;
  }
  get grundstueck() {
    return (this.immobilie as any).landDetails ?? null;
  }

  get accessIsNormal() {
    return this.exposeLevel === 'normal';
  }

  get accessIsShort() {
    return this.exposeLevel === 'gekürzt';
  }

  get accessIsExtended() {
    return this.exposeLevel === 'erweitert';
  }

  close() {
    this.router.navigate(['/']); // oder wo auch immer du hin willst
  }
}
