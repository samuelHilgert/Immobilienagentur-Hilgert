// Interface-Deklaration ganz oben
interface MediaItem {
  type: 'image' | 'video';
  file: File;
  url: string;
}

import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ImmobilienService } from '../../services/immobilien.service';
import { Immobilie, WohnungDetails } from '../../models/immobilie.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-immobilie-anlegen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatOptionModule,
    MatFormFieldModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: './immobilie-anlegen.component.html',
  styleUrls: ['./immobilie-anlegen.component.scss'],
})
export class ImmobilieAnlegenComponent {
  selectedArt: 'wohnung' | 'haus' | 'grundstueck' | '' = '';
  immobilie: Immobilie = this.initImmobilie();
  wohnung: WohnungDetails = this.initWohnungDetails();
  uploadedMedia: MediaItem[] = [];

  constructor(private immobilienService: ImmobilienService) {}

  setImmobilienArt(art: 'wohnung' | 'haus' | 'grundstueck') {
    this.selectedArt = art;
    this.immobilie = this.initImmobilie();
    if (art === 'wohnung') {
      this.wohnung = this.initWohnungDetails();
      this.syncWohnungWithImmobilie();
    }
  }

  // Synchronisiert die gemeinsamen Felder zwischen immobilie und wohnung
  private syncWohnungWithImmobilie() {
    // Explizite Zuweisung der gemeinsamen Felder
    this.wohnung.externalId = this.immobilie.externalId;
    this.wohnung.title = this.immobilie.title;
    this.wohnung.street = this.immobilie.street;
    this.wohnung.houseNumber = this.immobilie.houseNumber;
    this.wohnung.postcode = this.immobilie.postcode;
    this.wohnung.city = this.immobilie.city;
    this.wohnung.descriptionNote = this.immobilie.descriptionNote;
    this.wohnung.locationNote = this.immobilie.locationNote;
    this.wohnung.otherNote = this.immobilie.otherNote;
    this.wohnung.value = this.immobilie.value;
    this.wohnung.hasCourtage = this.immobilie.hasCourtage;
    this.wohnung.courtage = this.immobilie.courtage;
    this.wohnung.courtageNote = this.immobilie.courtageNote;
    this.wohnung.marketingType = this.immobilie.marketingType;
  }

  initImmobilie(): Immobilie {
    return {
      externalId: 'WNG_' + Date.now(),
      title: '',
      street: '',
      houseNumber: '',
      postcode: '',
      city: '',
      descriptionNote: '',
      locationNote: '',
      otherNote: '',
      value: 0,
      hasCourtage: 'NOT_APPLICABLE',
      courtage: '',
      courtageNote: '',
      creationDate: new Date().toISOString(),
      lastModificationDate: new Date().toISOString(),
      marketingType: 'Kauf',
    };
  }

  initWohnungDetails(): WohnungDetails {
    const baseImmobilie = this.initImmobilie();
    
    return {
      externalId: baseImmobilie.externalId,
      title: baseImmobilie.title,
      street: baseImmobilie.street,
      houseNumber: baseImmobilie.houseNumber,
      postcode: baseImmobilie.postcode,
      city: baseImmobilie.city,
      descriptionNote: baseImmobilie.descriptionNote,
      locationNote: baseImmobilie.locationNote,
      otherNote: baseImmobilie.otherNote,
      value: baseImmobilie.value,
      hasCourtage: baseImmobilie.hasCourtage,
      courtage: baseImmobilie.courtage,
      courtageNote: baseImmobilie.courtageNote,
      marketingType: baseImmobilie.marketingType,
      showAddress: false,
      contactId: '',
      currency: 'EUR',
      livingSpace: 0,
      numberOfRooms: 0,
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
      parkingSpaceType: '',
      parkingSpacePrice: 0,
      rented: 'NOT_APPLICABLE',
      thermalCharacteristic: 0,
      usableFloorSpace: 0,
      latitude: 0,
      longitude: 0,
      energyPerformanceCertificate: false,
      serviceCharge: 0,
    };
  }

  uploadMedia(event: any, type: 'image' | 'video') {
    let file: File | undefined;

    if (event instanceof File) {
      file = event;
    } else {
      const inputElement = event.target as HTMLInputElement;
      file = inputElement.files ? inputElement.files[0] : undefined;
    }

    if (!file) {
      console.error('Keine Datei ausgewählt');
      return;
    }

    // Validiere Dateityp
    if (type === 'image' && !file.type.startsWith('image/')) {
      console.error('Ungültiger Dateityp für Bild');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      console.error('Ungültiger Dateityp für Video');
      return;
    }

    const url = URL.createObjectURL(file);
    this.uploadedMedia.push({ type, file, url });
  }

  async submitWohnung(): Promise<void> {
    try {
      // Synchronisiere die Daten vor dem Speichern
      this.syncWohnungWithImmobilie();

      // Validiere Pflichtfelder
      if (!this.validateRequiredFields()) {
        console.error('Bitte füllen Sie alle Pflichtfelder aus');
        return;
      }

      // Speichere die Wohnung
      const response = await this.immobilienService.addWohnung(this.wohnung).toPromise();

      if (response?.error) {
        throw new Error(response.error);
      }

      // Upload der Medien nach erfolgreicher Speicherung
      await this.uploadAllMedia();

      console.log('Wohnung und Medien erfolgreich gespeichert');
      
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  }

  private validateRequiredFields(): boolean {
    const requiredFields: (keyof WohnungDetails)[] = [
      'title',
      'city',
      'postcode',
      'value',
      'livingSpace',
      'numberOfRooms'
    ];

    return requiredFields.every(field => {
      const value = this.wohnung[field];
      return value !== undefined && value !== null && value !== '';
    });
  }

  private async uploadAllMedia(): Promise<void> {
    const uploadPromises = this.uploadedMedia.map((media, index) => {
      const formData = new FormData();
      formData.append('file', media.file);
      formData.append('type', media.type);
      formData.append('externalId', this.wohnung.externalId!);

      return this.immobilienService.uploadMedia(formData, this.wohnung.externalId!)
        .toPromise()
        .then(response => {
          if (response?.error) {
            throw new Error(`Fehler beim Upload von Medium ${index + 1}: ${response.error}`);
          }
          return response;
        });
    });

    await Promise.all(uploadPromises);
  }

  submitHaus() {
    alert('Haus Formular noch nicht fertig');
  }

  submitGrundstueck() {
    alert('Grundstück Formular noch nicht fertig');
  }
}