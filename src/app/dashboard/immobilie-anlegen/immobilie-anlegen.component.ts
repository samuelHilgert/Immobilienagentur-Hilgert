// Interface-Deklaration ganz oben
interface MediaItem {
  type: 'image' | 'video';
  file: File;
  url: string;
}

import { Component } from '@angular/core';
import { ImmobilienService } from '../../services/immobilien.service';
import { Immobilie, WohnungDetails } from '../../models/immobilie.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-immobilie-anlegen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './immobilie-anlegen.component.html',
  styleUrls: ['./immobilie-anlegen.component.scss']
})

export class ImmobilieAnlegenComponent {
  selectedArt: 'wohnung' | 'haus' | 'grundstueck' | '' = '';
  immobilie: Immobilie = this.initImmobilie();
  wohnung: WohnungDetails = this.initWohnungDetails();
  
  // Hier speichern wir die hochgeladenen Medien (Dateien!)
  uploadedMedia: MediaItem[] = [];

  constructor(private immobilienService: ImmobilienService, private http: HttpClient) {}

  // Setzt die Art der Immobilie und initialisiert die Felder neu
  setImmobilienArt(art: 'wohnung' | 'haus' | 'grundstueck') {
    this.selectedArt = art;
    this.immobilie = this.initImmobilie();
    if (art === 'wohnung') {
      this.wohnung = this.initWohnungDetails();
    }
  }

  // Standardwerte für Immobilie
  initImmobilie(): Immobilie {
    return {
      externalId: '', title: '', street: '', houseNumber: '', postcode: '', city: '',
      descriptionNote: '', locationNote: '', otherNote: '', value: 0,
      hasCourtage: 'NOT_APPLICABLE', courtage: '', courtageNote: '',
      creationDate: new Date().toISOString(), lastModificationDate: new Date().toISOString(),
      marketingType: 'PURCHASE'
    };
  }

  // Standardwerte für Wohnungsdetails
  initWohnungDetails(): WohnungDetails {
    return {
      externalId: '', title: '', street: '', houseNumber: '', postcode: '', city: '',
      showAddress: false, contactId: '', value: 0, currency: 'EUR',
      livingSpace: 0, numberOfRooms: 0, hasCourtage: 'NOT_APPLICABLE',
      marketingType: 'PURCHASE', priceIntervalType: 'ONE_TIME_CHARGE',
      searchField1: '', searchField2: '', searchField3: '',
      groupNumber: 0, furnishingNote: '', apartmentType: 'NO_INFORMATION',
      floor: 0, lift: false, balcony: false, builtInKitchen: false,
      garden: false, numberOfBedRooms: 0, numberOfBathRooms: 0,
      guestToilet: 'NOT_APPLICABLE', parkingSpaceType: '', parkingSpacePrice: 0,
      rented: 'NOT_APPLICABLE', thermalCharacteristic: 0,
      usableFloorSpace: 0, latitude: 0, longitude: 0,
      creationDate: new Date().toISOString(), lastModificationDate: new Date().toISOString(),
      energyPerformanceCertificate: false, serviceCharge: 0
    };
  }

  // 📂 Dateiupload-Funktion für Bilder & Videos
  uploadMedia(event: any, type: 'image' | 'video') {
    let file: File | undefined;
  
    // Wenn direkt ein File übergeben wird (z. B. aus dem Input-Change Event)
    if (event instanceof File) {
      file = event;
    } else {
      // Andernfalls casten wir event.target in ein HTMLInputElement
      const inputElement = event.target as HTMLInputElement;
      file = inputElement.files ? inputElement.files[0] : undefined;
    }
  
    if (!file) return;
  
    // Erzeugen einer lokalen URL für die Vorschau
    const url = URL.createObjectURL(file);
  
    // Dateiobjekt inkl. URL speichern
    this.uploadedMedia.push({ type, file, url });
  }
  

  // 🏡 Immobilie + Wohnung speichern
  submitWohnung() {
    if (!this.immobilie || !this.wohnung) return;

    // **Schritt 1**: Immobilie speichern
    this.immobilienService.addImmobilie(this.immobilie).subscribe(
      (response) => {
        alert('Immobilie erfolgreich gespeichert!');

        // ✅ ExternalId aus `response.immobilie` speichern
        this.wohnung.externalId = response.immobilie.externalId;

        // **Schritt 2**: Wohnungsdetails mit externer ID speichern
        this.immobilienService.addWohnung(this.wohnung).subscribe(
          () => {
            alert('Wohnungsdetails erfolgreich gespeichert!');

            // **Schritt 3**: Medien hochladen
            this.uploadedMedia.forEach(media => {
              this.uploadFile(media.file, media.type, this.wohnung.externalId!);
            });
          },
          () => alert('Fehler beim Speichern der Wohnungsdetails')
        );
      },
      () => alert('Fehler beim Speichern der Immobilie')
    );
  }

  // 📂 Datei hochladen (Bilder & Videos)
  uploadFile(file: File, type: 'image' | 'video', externalId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('externalId', externalId);
    formData.append('type', type);

    this.http.post<{ message: string; url: string }>(
      'https://immo.samuelhilgert.com/backend/api/upload_media.php',
      formData
    ).subscribe(response => {
      console.log(`${type} hochgeladen:`, response.url);
    }, error => {
      console.error(`Fehler beim Hochladen des ${type}:`, error);
    });
  }

  submitHaus() {
    alert('Haus Formular noch nicht fertig');
  }

  submitGrundstueck() {
    alert('Grundstück Formular noch nicht fertig');
  }
}
