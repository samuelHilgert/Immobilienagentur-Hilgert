// Interface-Deklaration ganz oben
interface MediaItem {
  type: 'image' | 'video';
  file: File;
  url: string;
}

import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ImmobilienService } from '../../../services/immobilien.service';
import {
  GrundstueckDetails,
  HausDetails,
  Immobilie,
  WohnungDetails,
} from '../../../models/immobilie.model';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MediaAttachment } from '../../../models/media.model';
import { CustomerService } from '../../../services/customer.service';
import { Customer, CustomerRole } from '../../../models/customer.model';

@Component({
  selector: 'app-immobilie-anlegen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatOptionModule,
    MatFormFieldModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: './immobilie-anlegen.component.html',
  styleUrls: ['./immobilie-anlegen.component.scss'],
})
export class ImmobilieAnlegenComponent implements OnInit {
  selectedArt: 'wohnung' | 'haus' | 'grundstueck' | '' = '';
  immobilie: Immobilie = this.initImmobilie();
  wohnung: WohnungDetails = this.initWohnungDetails();
  haus: HausDetails = this.initHausDetails();
  grundstueck: GrundstueckDetails = this.initGrundstueckDetails();
  uploadedMedia: MediaAttachment[] = [];
  titleImageId: string | number | null = null;
  isLoading = false;
  // In der ImmobilieAnlegenComponent-Klasse hinzufügen:
  successMessage: string = '';
  errorMessage: string = '';
  owners: Customer[] = [];
  vertretendePersonen: Customer[] = [];
  objektnachweisStatus: 'checking' | 'exists' | 'missing' = 'checking';
  objektnachweisUrl: string = '';

  constructor(
    private immobilienService: ImmobilienService,
    private customerService: CustomerService
  ) {}

  async ngOnInit() {
    this.selectedArt = 'wohnung';
    this.immobilie = this.initImmobilie();
    this.wohnung = this.initWohnungDetails();
    this.haus = this.initHausDetails();
    await this.generateIds();
    await this.loadOwners();
    await this.loadVertretende();
    await this.checkObjektnachweis();
  }

  async loadOwners(): Promise<void> {
    const allCustomers = await this.customerService.getAllCustomers();
    this.owners = allCustomers.filter(
      (c) =>
        c.roles?.includes(CustomerRole.Verkäufer) ||
        c.roles?.includes(CustomerRole.Eigentümer)
    );
  }

  async loadVertretende(): Promise<void> {
    const allCustomers = await this.customerService.getAllCustomers();
    this.vertretendePersonen = allCustomers.filter((c) =>
      c.roles?.includes(CustomerRole.Vertretung)
    );
  }

  async generateIds(): Promise<void> {
    this.immobilie.externalId =
      await this.immobilienService.generateUniqueExternalId();
    this.immobilie.indexId = await this.immobilienService.getNextIndexId();
  }

  async setImmobilienArt(art: 'wohnung' | 'haus' | 'grundstueck') {
    this.selectedArt = art;
    this.immobilie = this.initImmobilie();
    await this.generateIds();

    // PropertyType basierend auf der Auswahl setzen
    if (art === 'wohnung') {
      this.immobilie.propertyType = 'Wohnung';
      this.wohnung = this.initWohnungDetails();
      this.syncWohnungWithImmobilie();
    } else if (art === 'haus') {
      this.immobilie.propertyType = 'Haus';
      this.haus = this.initHausDetails();
      this.syncHausWithImmobilie();
    } else if (art === 'grundstueck') {
      this.immobilie.propertyType = 'Grundstück';
      this.grundstueck = this.initGrundstueckDetails();
      this.syncGrundstueckWithImmobilie();
    }
  }

  // Synchronisiert die gemeinsamen Felder zwischen immobilie und wohnung
  private syncWohnungWithImmobilie() {
    // Explizite Zuweisung der gemeinsamen Felder
    if (this.immobilie.externalId)
      this.wohnung.externalId = this.immobilie.externalId;
    this.wohnung.title = this.immobilie.title;
    this.wohnung.street = this.immobilie.street;
    this.wohnung.houseNumber = this.immobilie.houseNumber;
    this.wohnung.postcode = this.immobilie.postcode;
    this.wohnung.city = this.immobilie.city;
    this.wohnung.longitude = this.immobilie.longitude;
    this.wohnung.latitude = this.immobilie.latitude;
    this.wohnung.longitudeWithNo = this.immobilie.longitudeWithNo;
    this.wohnung.latitudeWithNo = this.immobilie.latitudeWithNo;
    if (this.immobilie.descriptionNote)
      this.wohnung.descriptionNote = this.immobilie.descriptionNote;
    this.wohnung.value = this.immobilie.value;
    this.wohnung.livingSpace = this.immobilie.livingSpace;
    this.wohnung.numberOfRooms = this.immobilie.numberOfRooms;
    this.wohnung.hasCourtage = this.immobilie.hasCourtage;
    if (this.immobilie.courtage)
      this.wohnung.courtage = this.immobilie.courtage;
    if (this.immobilie.courtageNote)
      this.wohnung.courtageNote = this.immobilie.courtageNote;
  }

  // Synchronisiert die gemeinsamen Felder zwischen immobilie und wohnung
  private syncHausWithImmobilie() {
    // Explizite Zuweisung der gemeinsamen Felder
    if (this.immobilie.externalId)
      this.haus.externalId = this.immobilie.externalId;
    this.haus.title = this.immobilie.title;
    this.haus.street = this.immobilie.street;
    this.haus.houseNumber = this.immobilie.houseNumber;
    this.haus.postcode = this.immobilie.postcode;
    this.haus.city = this.immobilie.city;
    this.haus.longitude = this.immobilie.longitude;
    this.haus.latitude = this.immobilie.latitude;
    this.haus.longitudeWithNo = this.immobilie.longitudeWithNo;
    this.haus.latitudeWithNo = this.immobilie.latitudeWithNo;
    if (this.immobilie.descriptionNote)
      this.haus.descriptionNote = this.immobilie.descriptionNote;
    this.haus.value = this.immobilie.value;
    this.haus.livingSpace = this.immobilie.livingSpace;
    this.haus.plotArea = this.immobilie.plotArea;
    this.haus.numberOfRooms = this.immobilie.numberOfRooms;
    this.haus.hasCourtage = this.immobilie.hasCourtage;
    if (this.immobilie.courtage) this.haus.courtage = this.immobilie.courtage;
    if (this.immobilie.courtageNote)
      this.haus.courtageNote = this.immobilie.courtageNote;
  }

  // Synchronisiert die gemeinsamen Felder zwischen immobilie und wohnung
  private syncGrundstueckWithImmobilie() {
    // Explizite Zuweisung der gemeinsamen Felder
    if (this.immobilie.externalId)
      this.grundstueck.externalId = this.immobilie.externalId;
    this.grundstueck.title = this.immobilie.title;
    this.grundstueck.street = this.immobilie.street;
    this.grundstueck.houseNumber = this.immobilie.houseNumber;
    this.grundstueck.postcode = this.immobilie.postcode;
    this.grundstueck.city = this.immobilie.city;
    this.grundstueck.longitude = this.immobilie.longitude;
    this.grundstueck.latitude = this.immobilie.latitude;
    this.grundstueck.longitudeWithNo = this.immobilie.longitudeWithNo;
    this.grundstueck.latitudeWithNo = this.immobilie.latitudeWithNo;
    if (this.immobilie.descriptionNote)
      this.grundstueck.descriptionNote = this.immobilie.descriptionNote;
    this.grundstueck.value = this.immobilie.value;
    this.grundstueck.livingSpace = this.immobilie.livingSpace;
    this.grundstueck.plotArea = this.immobilie.plotArea;
    this.grundstueck.numberOfRooms = this.immobilie.numberOfRooms;
    this.grundstueck.hasCourtage = this.immobilie.hasCourtage;
    if (this.immobilie.courtage)
      this.grundstueck.courtage = this.immobilie.courtage;
    if (this.immobilie.courtageNote)
      this.grundstueck.courtageNote = this.immobilie.courtageNote;
  }

  initImmobilie(): Immobilie {
    return {
      externalId: '',
      indexId: 0,
      title: '',
      street: '',
      houseNumber: '',
      postcode: '',
      city: '',
      descriptionNote: '',
      introNote: '',
      latitude: 0,
      longitude: 0,
      latitudeWithNo: 0,
      longitudeWithNo: 0,
      value: 0,
      hasCourtage: 'NOT_APPLICABLE',
      courtage: '',
      courtageNote: '',
      numberOfRooms: 0,
      plotArea: 0,
      livingSpace: 0,
      creationDate: this.formatDate(new Date()),
      lastModificationDate: this.formatDate(new Date()),
      marketingType: 'PURCHASE',
      propertyType: 'Wohnung',
      propertyStatus: 'Bearbeitung',
      ownerIds: [],
      representingPersonIds: [],
      extendedExposeAvailable: false,
      uploadPublicTargets: {
        homepage: false,
        immoScout: false,
        facebook: false,
        instagram: false,
        newsletter: false,
        magazin: false,
      },
      sendCustomerTargets: {
        investoren: false,
        suchende: false,
        partner: false,
      },
      autoExposeSend: false,
      // Finanzierungsbeispiel
      debitInterest: 0,
      effectiveInterestRate: 0,
      transferTax: 0,
      notaryFee: 0,
      courtageNumber: 0,
      capitalEmployed: 0,
      fixedInterestRates: 0,
      fixedMonthlyRate: 0,
    };
  }

  initWohnungDetails(): WohnungDetails {
    return {
      externalId: '',
      title: '',
      street: '',
      houseNumber: '',
      postcode: '',
      city: '',
      descriptionNote: '',
      value: 0,
      hasCourtage: 'NOT_APPLICABLE',
      courtage: '',
      courtageNote: '',
      marketingType: 'PURCHASE',
      numberOfRooms: 0,
      livingSpace: 0,
      showAddress: false,
      contactId: '',
      currency: 'EUR',
      priceIntervalType: 'ONE_TIME_CHARGE',
      searchField1: '',
      searchField2: '',
      searchField3: '',
      groupNumber: 0,
      furnishingNote: '',
      apartmentType: 'NO_INFORMATION',
      floor: 0,
      lift: false,
      balcony: false,
      builtInKitchen: false,
      garden: false,
      numberOfBedRooms: 0,
      numberOfBathRooms: 0,
      guestToilet: 'NOT_APPLICABLE',
      cellar: 'NOT_APPLICABLE',
      handicappedAccessible: 'NOT_APPLICABLE',
      numberOfParkingSpaces: '',
      parkingSpaceType: '',
      parkingSpacePrice: 0,
      condition: 'NO_INFORMATION',
      constructionYear: 0,
      constructionYearUnknown: false,
      lastRefurbishment: '',
      listed: 'NOT_APPLICABLE',
      interiorQuality: 'NO_INFORMATION',
      serviceCharge: 0,
      maintenanceReserve: '',
      rented: 'NOT_APPLICABLE',
      rentalIncome: 0,
      tenancy: 0,
      leaseholdInterest: 0,
      freeFrom: '',
      summerResidencePractical: 'NOT_APPLICABLE',
      energyPerformanceCertificate: false,
      buildingEnergyRatingType: 'NO_INFORMATION',
      thermalCharacteristic: 0,
      energyConsumptionContainsWarmWater: 'NOT_APPLICABLE',
      firingType: '',
      heatingType: '',
      numberOfFloors: 0,
      usableFloorSpace: 0,
      latitude: 0,
      longitude: 0,
      latitudeWithNo: 0,
      longitudeWithNo: 0,
      locationNote: '',
      otherNote: '',
    };
  }

  initHausDetails(): HausDetails {
    return {
      externalId: '',
      title: '',
      street: '',
      houseNumber: '',
      postcode: '',
      city: '',
      descriptionNote: '',
      value: 0,
      hasCourtage: 'NOT_APPLICABLE',
      courtage: '',
      courtageNote: '',
      marketingType: 'PURCHASE',
      numberOfRooms: 0,
      livingSpace: 0,
      plotArea: 0,
      showAddress: false,
      contactId: '',
      currency: 'EUR',
      priceIntervalType: 'ONE_TIME_CHARGE',
      searchField1: '',
      searchField2: '',
      searchField3: '',
      groupNumber: 0,
      furnishingNote: '',
      numberOfBedRooms: 0,
      numberOfBathRooms: 0,
      guestToilet: 'NOT_APPLICABLE',
      builtInKitchen: false,
      cellar: 'NOT_APPLICABLE',
      handicappedAccessible: 'NOT_APPLICABLE',
      numberOfParkingSpaces: '',
      parkingSpaceType: '',
      parkingSpacePrice: 0,
      condition: 'NO_INFORMATION',
      constructionYear: 0,
      constructionYearUnknown: false,
      lastRefurbishment: '',
      listed: 'NOT_APPLICABLE',
      interiorQuality: 'NO_INFORMATION',
      rented: 'NOT_APPLICABLE',
      rentalIncome: 0,
      tenancy: 0,
      leaseholdInterest: 0,
      freeFrom: '',
      summerResidencePractical: 'NOT_APPLICABLE',
      energyPerformanceCertificate: false,
      buildingEnergyRatingType: 'NO_INFORMATION',
      thermalCharacteristic: 0,
      energyConsumptionContainsWarmWater: 'NOT_APPLICABLE',
      firingType: '',
      heatingType: '',
      numberOfFloors: 0,
      usableFloorSpace: 0,
      latitude: 0,
      longitude: 0,
      latitudeWithNo: 0,
      longitudeWithNo: 0,
      locationNote: '',
      otherNote: '',
      lodgerFlat: 'NOT_APPLICABLE',
      constructionPhase: 'NO_INFORMATION',
      buildingType: 'NO_INFORMATION',
    };
  }

  initGrundstueckDetails(): GrundstueckDetails {
    return {
      externalId: '',
      title: '',
      street: '',
      houseNumber: '',
      postcode: '',
      city: '',
      descriptionNote: '',
      value: 0,
      hasCourtage: 'NOT_APPLICABLE',
      courtage: '',
      courtageNote: '',
      marketingType: 'PURCHASE',
      numberOfRooms: 0,
      livingSpace: 0,
      plotArea: 0,
      showAddress: false,
      contactId: '',
      currency: 'EUR',
      priceIntervalType: 'ONE_TIME_CHARGE',
      searchField1: '',
      searchField2: '',
      searchField3: '',
      groupNumber: 0,
      locationNote: '',
      otherNote: '',
      tenancy: 0,
      freeFrom: '',
      latitude: 0,
      longitude: 0,
      latitudeWithNo: 0,
      longitudeWithNo: 0,
      commercializationType: 'BUY',
      recommendedUseTypes: 'NO_INFORMATION',
      minDivisible: 0,
      shortTermConstructible: false,
      buildingPermission: false,
      demolition: false,
      siteDevelopmentType: 'NO_INFORMATION',
      siteConstructibleType: 'NO_INFORMATION',
      grz: 0,
      gfz: 0,
    };
  }

  // Datum in das richtige Format (für API ImmoScout24) setzen:
  formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1); // Monate: 0-basiert
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${MM}-${dd}:${hh}:${mm}:${ss}`;
  }

  // Medien hochladen
  async uploadMedia(event: any, type: 'image' | 'video'): Promise<void> {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    this.isLoading = true;

    try {
      // Für mehrere Dateien (Bilder)
      if (type === 'image' && files.length > 1) {
        for (let i = 0; i < files.length; i++) {
          await this.uploadSingleFile(files[i], type);
        }
      } else {
        // Für einzelne Datei
        await this.uploadSingleFile(files[0], type);
      }
    } catch (error) {
      console.error('Fehler beim Hochladen:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async uploadSingleFile(file: File, type: 'image' | 'video'): Promise<void> {
    try {
      // Stelle sicher, dass externalId ein String ist
      const externalId = this.immobilie.externalId || '';

      const response = await this.immobilienService.uploadMedia(
        file,
        externalId,
        type
      );

      if (response.success) {
        const media: MediaAttachment = {
          id: response.id,
          externalId: externalId,
          type: type,
          url: response.url,
          isTitleImage: false,
        };

        this.uploadedMedia.push(media);

        // Wenn dies das erste Bild ist, setze es als Titelbild
        if (type === 'image' && !this.titleImageId && response.id) {
          this.titleImageId = response.id;
          await this.updateTitleImage(response.id);
        }
      }
    } catch (error) {
      console.error('Fehler beim Hochladen:', error);
    }
  }

  async updateTitleImage(mediaId: string | number): Promise<void> {
    try {
      this.errorMessage = '';
      const externalId = this.immobilie.externalId || '';
      const mediaIdStr = String(mediaId);

      const response = await this.immobilienService.setTitleImage(
        mediaIdStr,
        externalId
      );

      if (response.success) {
        this.uploadedMedia.forEach((media) => {
          media.isTitleImage = this.getString(media.id) === mediaId;
        });
        this.successMessage = 'Titelbild erfolgreich festgelegt';
      } else {
        this.errorMessage =
          response.error || 'Fehler beim Festlegen des Titelbilds';
      }
    } catch (error) {
      console.error('Fehler beim Festlegen des Titelbilds:', error);
      this.errorMessage = 'Fehler beim Festlegen des Titelbilds';
    }
  }

  async setTitleImage(mediaId: string): Promise<void> {
    try {
      // Stelle sicher, dass externalId ein String ist
      const externalId = this.immobilie.externalId || '';

      const response = await this.immobilienService.setTitleImage(
        mediaId,
        externalId
      );

      if (response.success) {
        // Update lokalen Status mit getString für sicheren Vergleich
        this.uploadedMedia.forEach((media) => {
          media.isTitleImage = this.getString(media.id) === mediaId;
        });
      }
    } catch (error) {
      console.error('Fehler beim Festlegen des Titelbilds:', error);
    }
  }

  async deleteMedia(media: MediaAttachment): Promise<void> {
    if (!media.id) {
      this.errorMessage = 'Keine Media-ID zum Löschen vorhanden';
      return;
    }

    try {
      this.errorMessage = '';
      const response = await this.immobilienService.deleteMedia(
        String(media.id)
      );

      if (response.success) {
        this.uploadedMedia = this.uploadedMedia.filter(
          (m) => m.id !== media.id
        );

        if (
          this.titleImageId !== null &&
          this.getString(this.titleImageId) === this.getString(media.id)
        ) {
          const firstImage = this.uploadedMedia.find((m) => m.type === 'image');
          this.titleImageId = firstImage?.id || null;
          if (this.titleImageId) {
            await this.updateTitleImage(this.titleImageId);
          }
        }

        this.successMessage = 'Medium erfolgreich gelöscht';
      } else {
        this.errorMessage = response.error || 'Fehler beim Löschen des Mediums';
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      this.errorMessage = 'Fehler beim Löschen des Mediums';
    }
  }

  // Methode zum Speichern der Wohnung
  async submitWohnung(): Promise<void> {
    try {
      this.errorMessage = '';
      this.successMessage = '';

      this.syncWohnungWithImmobilie();

      if (!this.validateRequiredFields()) {
        this.errorMessage = 'Bitte füllen Sie alle Pflichtfelder aus';
        return;
      }

      const response = await this.immobilienService.saveWohnung(
        this.immobilie,
        this.wohnung
      );

      if (!response.success) {
        this.errorMessage =
          response.error || 'Unbekannter Fehler beim Speichern';
        throw new Error(this.errorMessage);
      }

      if (this.uploadedMedia.length > 0 && this.titleImageId) {
        await this.updateTitleImage(this.titleImageId);
      }

      this.successMessage = 'Wohnung erfolgreich gespeichert';
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      if (!this.errorMessage) {
        this.errorMessage = 'Ein Fehler ist aufgetreten beim Speichern';
      }
    }
  }

  async submitHaus(): Promise<void> {
    try {
      this.errorMessage = '';
      this.successMessage = '';

      this.syncHausWithImmobilie();

      if (!this.validateRequiredFields()) {
        this.errorMessage = 'Bitte füllen Sie alle Pflichtfelder aus';
        return;
      }

      const response = await this.immobilienService.saveHaus(
        this.immobilie,
        this.haus
      );

      if (!response.success) {
        this.errorMessage =
          response.error || 'Unbekannter Fehler beim Speichern';
        throw new Error(this.errorMessage);
      }

      if (this.uploadedMedia.length > 0 && this.titleImageId) {
        await this.updateTitleImage(this.titleImageId);
      }

      this.successMessage = 'Haus erfolgreich gespeichert';
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      if (!this.errorMessage) {
        this.errorMessage = 'Ein Fehler ist aufgetreten beim Speichern';
      }
    }
  }

  async submitGrundstueck(): Promise<void> {
    try {
      this.errorMessage = '';
      this.successMessage = '';

      this.syncGrundstueckWithImmobilie();

      if (!this.validateRequiredFields()) {
        this.errorMessage = 'Bitte füllen Sie alle Pflichtfelder aus';
        return;
      }

      const response = await this.immobilienService.saveGrundstueck(
        this.immobilie,
        this.grundstueck
      );

      if (!response.success) {
        this.errorMessage =
          response.error || 'Unbekannter Fehler beim Speichern';
        throw new Error(this.errorMessage);
      }

      if (this.uploadedMedia.length > 0 && this.titleImageId) {
        await this.updateTitleImage(this.titleImageId);
      }

      this.successMessage = 'Haus erfolgreich gespeichert';
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      if (!this.errorMessage) {
        this.errorMessage = 'Ein Fehler ist aufgetreten beim Speichern';
      }
    }
  }

  async checkObjektnachweis(): Promise<void> {
    const externalId = this.immobilie.externalId;
    if (!externalId) {
      this.objektnachweisStatus = 'missing';
      return;
    }

    try {
      this.objektnachweisStatus = 'checking';
      const result = await this.immobilienService.checkObjektnachweisExists(
        externalId
      );

      this.objektnachweisStatus = result.exists ? 'exists' : 'missing';
      this.objektnachweisUrl = result.url ?? '';
    } catch (error) {
      console.error('Fehler bei Objektnachweis-Prüfung:', error);
      this.objektnachweisStatus = 'missing';
    }
  }

  async onObjektnachweisSelected(event: any): Promise<void> {
    const file: File = event.target.files?.[0];

    if (!file || !file.name.endsWith('.pdf')) {
      alert('Bitte eine PDF-Datei hochladen');
      return;
    }

    const externalId = this.immobilie.externalId;

    if (!externalId) {
      alert('Externe ID fehlt – bitte Immobilie speichern');
      return;
    }

    try {
      const uploadResult = await this.immobilienService.uploadObjektnachweis(
        file,
        externalId
      );

      if (uploadResult.success) {
        this.successMessage = 'Objektnachweis erfolgreich hochgeladen ✅';

        // Optional kurze Wartezeit für sichereren Zugriff
        await this.delay(1000);

        // 🔁 Direkt prüfen, ob er jetzt im Storage ist
        const checkResult =
          await this.immobilienService.checkObjektnachweisExists(externalId);
        this.objektnachweisStatus = checkResult.exists ? 'exists' : 'missing';
        this.objektnachweisUrl = checkResult.url ?? '';
      } else {
        this.errorMessage = uploadResult.error || 'Fehler beim Hochladen ❌';
        this.objektnachweisStatus = 'missing';
      }
    } catch (error) {
      console.error('Fehler beim Objektnachweis-Upload:', error);
      this.errorMessage = 'Fehler beim Hochladen ❌';
      this.objektnachweisStatus = 'missing';
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Validiert Pflichtfelder
  private validateRequiredFields(): boolean {
    if (this.selectedArt === 'wohnung') {
      const requiredWohnungFields: (keyof WohnungDetails)[] = [
        'title',
        'city',
        'postcode',
      ];
      return requiredWohnungFields.every((field) => {
        const value = this.wohnung[field];
        return value !== undefined && value !== null && value !== '';
      });
    }

    if (this.selectedArt === 'haus') {
      const requiredHausFields: (keyof HausDetails)[] = [
        'title',
        'city',
        'postcode',
      ];
      return requiredHausFields.every((field) => {
        const value = this.haus[field];
        return value !== undefined && value !== null && value !== '';
      });
    }

    if (this.selectedArt === 'grundstueck') {
      const requiredGrundstueckFields: (keyof GrundstueckDetails)[] = [
        'title',
        'city',
        'postcode',
      ];
      return requiredGrundstueckFields.every((field) => {
        const value = this.grundstueck[field];
        return value !== undefined && value !== null && value !== '';
      });
    }

    // falls selectedArt nicht gesetzt oder unbekannt
    return false;
  }

  // Hilfsmethoden für Checkbox-Bindung
  isYesValue(value: any): boolean {
    return value === 'YES';
  }

  getYesNoValue(isChecked: boolean): 'YES' | 'NOT_APPLICABLE' {
    return isChecked ? 'YES' : 'NOT_APPLICABLE';
  }

  String(value: any): string {
    return value !== null && value !== undefined ? value.toString() : '';
  }

  // Hilfsmethode zur String-Konvertierung für Vergleiche
  getString(value: any): string {
    return value !== null && value !== undefined ? value.toString() : '';
  }

  // bessere Methode um Checkfelder zu verarbeiten
  getCheckboxValue(obj: any, key: keyof any): boolean {
    return obj?.[key] === 'YES';
  }

  setCheckboxValue(obj: any, key: keyof any, value: boolean): void {
    obj[key] = value ? 'YES' : 'NOT_APPLICABLE';
  }
}
