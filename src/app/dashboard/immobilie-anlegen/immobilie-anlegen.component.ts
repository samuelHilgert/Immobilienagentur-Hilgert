import { Component } from '@angular/core';
import { ImmobilienService } from '../../services/immobilien.service';
import { Immobilie, WohnungDetails } from '../../models/immobilie.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private immobilienService: ImmobilienService) {}

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

  // 🏡 Immobilie + Wohnung speichern
  submitWohnung() {
    if (!this.immobilie || !this.wohnung) return;

    // **Schritt 1**: Immobilie speichern
    this.immobilienService.addImmobilie(this.immobilie).subscribe(
      (response) => {
        alert('Immobilie erfolgreich gespeichert!');

        // **Schritt 2**: Wohnungsdetails mit externer ID speichern
        this.wohnung.externalId = response.immobilie.externalId;

        this.immobilienService.addWohnung(this.wohnung).subscribe(
          () => alert('Wohnungsdetails erfolgreich gespeichert!'),
          () => alert('Fehler beim Speichern der Wohnungsdetails')
        );
      },
      () => alert('Fehler beim Speichern der Immobilie')
    );
  }

  submitHaus() {
    alert('Haus Formular noch nicht fertig');
  }

  submitGrundstueck() {
    alert('Grundstück Formular noch nicht fertig');
  }
}
