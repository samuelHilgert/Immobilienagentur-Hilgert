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
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Nl2brPipe } from '../pipes/nl2br.pipe';
import { EnergieklasseDiagrammComponent } from '../energieklasse-diagramm/energieklasse-diagramm.component';
import { MediaService } from '../../services/media.service';
import { ImageDialogComponent } from '../image-dialog/image-dialog.component';

declare var html2pdf: any;

@Component({
  selector: 'app-expose-preview',
  standalone: true,
  imports: [
    CommonModule,
    MATERIAL_MODULES,
    RouterModule,
    Nl2brPipe,
    EnergieklasseDiagrammComponent,
  ],
  templateUrl: './epxose-preview.component.html',
  styleUrl: './epxose-preview.component.scss',
})
export class EpxosePreviewComponent implements OnInit {
  immobilie: Immobilie | null = null;
  exposeLevel: 'normal' | 'gekürzt' | 'erweitert' = 'normal';
  media: MediaAttachment[] = [];
  mediaFloorPlans: MediaAttachment[] = [];
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
    private router: Router,
    private mediaService: MediaService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    const inquiryProcessId =
      this.route.snapshot.paramMap.get('inquiryProcessId');
    if (!inquiryProcessId || !inquiryProcessId.includes('_')) return;

    const [customerId, propertyExternalId] = inquiryProcessId.split('_');

    try {
      const [immobilie, preview, mediaList] = await Promise.all([
        this.immobilienService.getProperty(propertyExternalId),
        this.exposePreviewService.getExposePreview(propertyExternalId),
        this.mediaService.getMediaForProperty(propertyExternalId),
      ]);

      const titleImage = mediaList.find((m) => m.isTitleImage);
      const fallbackImage = mediaList[0];
      const imageToUse = titleImage || fallbackImage;

      this.media = mediaList.filter((m) => m.category !== 'FLOOR_PLAN');
      this.mediaFloorPlans = mediaList.filter(
        (m) => m.category === 'FLOOR_PLAN'
      );

      this.immobilie = immobilie;
      this.loadDetails();

      if (preview.extendedExposeAccess?.includes(inquiryProcessId)) {
        this.exposeLevel = 'erweitert';
      } else if (preview.shortExposeAccess?.includes(inquiryProcessId)) {
        this.exposeLevel = 'gekürzt';
      } else {
        this.exposeLevel = 'normal';
      }

      console.log('Exposé-Level:', this.exposeLevel);
      console.log('Geladene Medien:', this.media);
    } catch (error) {
      console.error('Fehler beim Laden des Exposés:', error);
    }
  }

  // get title and second title images   
  getPrimaryTitleImage(): MediaAttachment | undefined {
    return this.media.find((m) => m.isTitleImage);
  }
  
  getAltTitleImage(): MediaAttachment | undefined {
    return this.media.find((m) => m.isAltTitleImage);
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

  getLabel(
    map: Record<string, string>,
    key: string | null | undefined
  ): string {
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

  printPage() {
    window.print();
  }

  downloadAsPDF() {
    const element = document.getElementById('printContent');
    if (!element) {
      console.warn('Druckbereich nicht gefunden!');
      return;
    }

    if (typeof html2pdf === 'undefined') {
      console.error('html2pdf ist nicht verfügbar!');
      return;
    }

    const opt = {
      margin: 0.5,
      filename: `Hilgert-Immobilien-Exposé-${
        this.immobilie?.externalId || 'immobilie'
      }.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().from(element).set(opt).save();
  }

  openImageDialog(imageUrl: string): void {
    const allMedia = [...this.media, ...this.mediaFloorPlans];
    const index = allMedia.findIndex((m) => m.url === imageUrl);

    this.dialog.open(ImageDialogComponent, {
      data: {
        mediaList: allMedia,
        currentIndex: index,
      },
      width: '90vw',
      maxWidth: '800px',
      height: '90vh',
      maxHeight: '800px',
      panelClass: 'image-dialog-panel',
    });
  }

  // Berechnungen für das Finanzierungsbeispiel
  get kaufpreis(): number {
    return this.immobilie?.value ?? 0;
  }

  get grunderwerbsteuer(): number {
    return this.kaufpreis * ((this.immobilie?.transferTax ?? 0) / 100);
  }

  get notargebuehr(): number {
    return this.kaufpreis * ((this.immobilie?.notaryFee ?? 0) / 100);
  }

  get maklergebuehr(): number {
    return this.kaufpreis * ((this.immobilie?.courtageNumber ?? 0) / 100);
  }

  get gesamtkosten(): number {
    return (
      this.kaufpreis +
      this.grunderwerbsteuer +
      this.notargebuehr +
      this.maklergebuehr
    );
  }

  get eingesetztesKapital(): number {
    return this.immobilie?.capitalEmployed ?? 0;
  }

  get benoetigtesDarlehen(): number {
    return this.gesamtkosten - this.eingesetztesKapital;
  }

  get monatlicheZinsen(): number {
    const darlehen = this.benoetigtesDarlehen;
    const sollzins = this.immobilie?.debitInterest ?? 0;

    return (darlehen * (sollzins / 100)) / 12;
  }

  get monatlicheTilgung(): number {
    return this.gesamtBelastung - this.monatlicheZinsen;
  }

  get gesamtBelastung(): number {
    return this.immobilie?.fixedMonthlyRate ?? 0;
  }

  // Grundrisse Galerie unten
  activeFloorIndex: number = 0;

  nextFloorPlan(): void {
    if (this.activeFloorIndex < this.mediaFloorPlans.length - 1) {
      this.activeFloorIndex++;
    }
  }

  prevFloorPlan(): void {
    if (this.activeFloorIndex > 0) {
      this.activeFloorIndex--;
    }
  }

  // do not allows rightclick on images
  disableContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  // getter functions to know what kind of property it is
  get isApartment(): boolean {
    return this.immobilie?.propertyType === 'Wohnung';
  }
  
  get isHouse(): boolean {
    return this.immobilie?.propertyType === 'Haus';
  }
  
  get isGrundstueck(): boolean {
    return this.immobilie?.propertyType === 'Grundstück';
  }

  // searching for video 
  getVideoMedia(): MediaAttachment | undefined {
    return this.media.find((m) => m.type === 'video');
  }
  
  
}
