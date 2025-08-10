import { Component, HostListener, Inject, OnInit } from '@angular/core';
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
import { PropertyInquiryService } from '../../services/property-inquiry.service';

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
  videoMedia: MediaAttachment[] = [];
  customerSalutation?: string;
  customerFirstName?: string;
  customerLastName?: string;

  constructor(
    private route: ActivatedRoute,
    private exposePreviewService: ExposePreviewService,
    private immobilienService: ImmobilienService,
    private router: Router,
    private mediaService: MediaService,
    private dialog: MatDialog,
    private inquiryService: PropertyInquiryService
  ) {}

  async ngOnInit() {
    const inquiryProcessId = this.route.snapshot.paramMap.get('inquiryProcessId');
    if (!inquiryProcessId || !inquiryProcessId.includes('_')) {
      this.router.navigate(['/expose-access-denied']); return;
    }
    const [customerId, propertyExternalId] = inquiryProcessId.split('_');
  
    // 1) Preview prüfen
    const preview = await this.exposePreviewService.getExposePreview(inquiryProcessId);
    if (!preview?.exposeAccessLevel ||
        preview.customerId !== customerId ||
        preview.propertyExternalId !== propertyExternalId) {
      this.router.navigate(['/expose-access-denied']); return;
    }
    this.exposeLevel = preview.exposeAccessLevel;
    this.customerSalutation = preview.salutation || '';
    this.customerFirstName  = preview.firstName  || '';
    this.customerLastName   = preview.lastName   || '';
  
    // 2) Prozess-Status prüfen
    const process = await this.inquiryService.getProcessByCustomerAndProperty(customerId, propertyExternalId);
    if (process?.inquiryProcessStatus === 'Ausgeschieden') {
      this.router.navigate(['/expose-access-denied']); return;
    }
  
    // 3) Immobilie laden + Status prüfen
    const immobilie = await this.immobilienService.getProperty(propertyExternalId) as Immobilie | null;
    if (!immobilie) { this.router.navigate(['/expose-access-denied']); return; }
  
    // exakt auf "Referenz" prüfen
    if (immobilie.propertyStatus === 'Referenz') {
      this.router.navigate(['/expose-access-denied']); return;
    }
  
    this.immobilie = immobilie;
  
    // 4) Medien + Videos parallel (Immobilie haben wir ja schon)
    const [mediaList, videoList] = await Promise.all([
      this.mediaService.getMediaForProperty(propertyExternalId),
      this.mediaService.getVideosForProperty(propertyExternalId),
    ]);
  
    this.videoMedia = videoList;
    this.media = mediaList
      .filter(m => m.category !== 'FLOOR_PLAN' && m.type === 'image')
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    this.mediaFloorPlans = mediaList
      .filter(m => m.category === 'FLOOR_PLAN')
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  
    this.loadDetails();
  }

  // get title and second title images
  getPrimaryTitleImage(): MediaAttachment | undefined {
    return this.media.find((m) => m.isTitleImage);
  }

  getAltTitleImage(): MediaAttachment | undefined {
    return this.media.find((m) => m.isAltTitleImage);
  }

  async loadDetails(): Promise<void> {
    // console.group('[Preview] loadDetails');
    const id = this.immobilie?.externalId;
    const type = this.immobilie?.propertyType;
    // console.log('externalId:', id, 'propertyType:', type);
    if (!id) {
      // console.warn('Kein externalId → abbrechen');
      // console.groupEnd();
      return;
    }

    try {
      const fullData = await this.immobilienService.getProperty(id);
      // console.log('fullData geladen:', !!fullData);

      if (type === 'Wohnung') {
        this.wohnungDetails = fullData.apartmentDetails;
        // console.log('wohnungDetails gesetzt:', !!this.wohnungDetails);
      } else if (type === 'Haus') {
        this.hausDetails = fullData.houseDetails;
        // console.log('hausDetails gesetzt:', !!this.hausDetails);
      } else if (type === 'Grundstück') {
        this.grundstueckDetails = fullData.landDetails;
        // console.log('grundstueckDetails gesetzt:', !!this.grundstueckDetails);
      } else {
        // console.warn('Unbekannter propertyType:', type);
      }
    } catch (error) {
      // console.error('Fehler beim Laden der Detaildaten:', error);
    } finally {
      // console.groupEnd();
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
    // console.log('Download starten...');

    const element = document.getElementById('printContent');
    if (!element) {
      // console.warn('Druckbereich nicht gefunden!');
      return;
    }

    if (typeof html2pdf === 'undefined') {
      // console.error('html2pdf ist nicht verfügbar!');
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

    // console.log('Optionen gesetzt, starte PDF-Erstellung...');
    html2pdf().from(element).set(opt).save();
  }

  showScrollToTop = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollToTop = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openImageDialog(imageUrl: string): void {
    const allMedia = [...this.media];
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

  get altTitleImage(): MediaAttachment | undefined {
    return this.media.find((m) => m.isAltTitleImage);
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
    return this.videoMedia[0];
  }
}
