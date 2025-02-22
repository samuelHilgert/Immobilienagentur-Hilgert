import { Component } from '@angular/core';
import { ImmobilienService } from '../../services/immobilien.service';
import { HausDetails, WohnungDetails, GrundstueckDetails } from '../../models/immobilie.model';
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
  selectedArt: 'haus' | 'wohnung' | 'grundstueck' | '' = '';

  hausDetails: HausDetails = this.initHausDetails();
  wohnungDetails: WohnungDetails = this.initWohnungDetails();
  grundstueckDetails: GrundstueckDetails = this.initGrundstueckDetails();

  constructor(private immobilienService: ImmobilienService) {}

  setImmobilienArt(art: 'haus' | 'wohnung' | 'grundstueck') {
    this.selectedArt = art;
  }

  initHausDetails(): HausDetails {
    return {
      externalId: '', title: '', street: '', houseNumber: '', postcode: '', city: '',
      showAddress: false, contactId: '', buildingType: 'NO_INFORMATION',
      value: 0, currency: 'EUR', livingSpace: 0, plotArea: 0, numberOfRooms: 0,
      hasCourtage: 'NOT_APPLICABLE', marketingType: 'PURCHASE', priceIntervalType: 'ONE_TIME_CHARGE'
    };
  }

  initWohnungDetails(): WohnungDetails {
    return {
      externalId: '', title: '', street: '', houseNumber: '', postcode: '', city: '',
      showAddress: false, contactId: '', value: 0, currency: 'EUR',
      livingSpace: 0, numberOfRooms: 0,
      hasCourtage: 'NOT_APPLICABLE', marketingType: 'PURCHASE', priceIntervalType: 'ONE_TIME_CHARGE'
    };
  }

  initGrundstueckDetails(): GrundstueckDetails {
    return {
      externalId: '', title: '', street: '', houseNumber: '', postcode: '', city: '',
      showAddress: false, contactId: '', commercializationType: 'BUY',
      value: 0, currency: 'EUR', plotArea: 0,
      hasCourtage: 'NOT_APPLICABLE', marketingType: 'PURCHASE', priceIntervalType: 'ONE_TIME_CHARGE'
    };
  }

  submitHaus() {
    if (!this.hausDetails) return;
    this.immobilienService.addHaus(this.hausDetails).subscribe(
      () => alert('Haus erfolgreich gespeichert!'),
      () => alert('Fehler beim Speichern des Hauses')
    );
  }

  submitWohnung() {
    if (!this.wohnungDetails) return;
    this.immobilienService.addWohnung(this.wohnungDetails).subscribe(
      () => alert('Wohnung erfolgreich gespeichert!'),
      () => alert('Fehler beim Speichern der Wohnung')
    );
  }

  submitGrundstueck() {
    if (!this.grundstueckDetails) return;
    this.immobilienService.addGrundstueck(this.grundstueckDetails).subscribe(
      () => alert('Grundstück erfolgreich gespeichert!'),
      () => alert('Fehler beim Speichern des Grundstücks')
    );
  }
}