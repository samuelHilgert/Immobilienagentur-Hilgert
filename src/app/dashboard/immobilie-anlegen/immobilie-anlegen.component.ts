import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ImmobilienService } from '../../services/immobilien.service';
import { HausDetails, Immobilie } from '../../models/immobilie.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-immobilie-anlegen',
  standalone: true,
  templateUrl: './immobilie-anlegen.component.html',
  styleUrls: ['./immobilie-anlegen.component.scss'],
  imports: [CommonModule, FormsModule] 
})
export class ImmobilieAnlegenComponent {
  selectedArt: string = ''; // Speichert die gewählte Immobilienart
  immobilie: Immobilie = {
    id: '',          
    titel: '',
    beschreibung: '',
    preis: '',      
    art: '',
    objekt_typ: '',
    status: '',
    plz: '',
    stadt: '',
    erstellt_am: '',
    aktualisiert_am: ''
  };

  // Speichert Haus-spezifische Felder
  hausDetails: HausDetails = {
    immobilie_id: '',
    title: '',
    street: '',
    houseNumber: '',
    postcode: '',
    city: '',
    descriptionNote: '',
    furnishingNote: '',
    locationNote: '',
    otherNote: '',
    showAddress: true,
    buildingType: 'NO_INFORMATION',
    numberOfRooms: '0',
    constructionYear: 0,
    energyPerformanceCertificate: false,
    heatingType: 'NO_INFORMATION',
    latitude: 0,
    longitude: 0
  };

  constructor(private immobilienService: ImmobilienService) {}

  // Setzt die Immobilienart und leert das Formular
  setImmobilienArt(art: string) {
    this.selectedArt = art;
    this.immobilie = { 
      id: '',
      titel: '', 
      beschreibung: '', 
      preis: '',  
      art: art, 
      objekt_typ: '', 
      status: '', 
      plz: '', 
      stadt: '', 
      erstellt_am: '', 
      aktualisiert_am: ''
    };

    this.hausDetails = {
      immobilie_id: '',
      title: '',
      street: '',
      houseNumber: '',
      postcode: '',
      city: '',
      descriptionNote: '',
      furnishingNote: '',
      locationNote: '',
      otherNote: '',
      showAddress: true,
      buildingType: 'NO_INFORMATION',
      numberOfRooms: '0',
      constructionYear: 0,
      energyPerformanceCertificate: false,
      heatingType: 'NO_INFORMATION',
      latitude: 0,
      longitude: 0
    };
  }

  // Sendet die Daten an den Service
  submitImmobilie() {
    // ✅ Sicherstellen, dass Preis als String gesendet wird
    const immobilieToSend: Immobilie = { 
      ...this.immobilie,
      preis: this.immobilie.preis.toString()
    };
  
    // ✅ 1. Immobilie speichern
    this.immobilienService.addImmobilie(immobilieToSend).subscribe(response => {
      if (response && response.immobilie && response.immobilie.id) {
        const immobilieId = response.immobilie.id; // ✅ ID der neu erstellten Immobilie
        
        // ✅ 2. Falls die Immobilie ein Haus ist, speichere sie zusätzlich in `haus_details`
        if (this.selectedArt === 'haus') {
          const hausDetails: HausDetails = {
            immobilie_id: immobilieId, // Hier setzen wir die ID
            title: this.hausDetails.title || '',
            street: this.hausDetails.street || '',
            houseNumber: this.hausDetails.houseNumber || '',
            postcode: this.hausDetails.postcode || '',
            city: this.hausDetails.city || '',
            descriptionNote: this.hausDetails.descriptionNote || '',
            furnishingNote: this.hausDetails.furnishingNote || '',
            locationNote: this.hausDetails.locationNote || '',
            showAddress: this.hausDetails.showAddress || false,
            buildingType: this.hausDetails.buildingType || 'NO_INFORMATION',
            numberOfRooms: this.hausDetails.numberOfRooms || '',
            constructionYear: this.hausDetails.constructionYear || undefined,
            energyPerformanceCertificate: this.hausDetails.energyPerformanceCertificate || false,
            heatingType: this.hausDetails.heatingType || 'NO_INFORMATION',
            latitude: this.hausDetails.latitude || 0,
            longitude: this.hausDetails.longitude || 0
          };
  
          this.immobilienService.addHaus(hausDetails).subscribe(response => {
            console.log('Haus gespeichert:', response);
            alert('Haus erfolgreich angelegt!');
          }, error => {
            console.error('Fehler beim Speichern des Hauses:', error);
            alert('Fehler beim Speichern der Haus-Details.');
          });
        } else {
          alert('Immobilie erfolgreich angelegt!');
        }
      } else {
        alert('Fehler: Keine ID von add_immobilie.php erhalten.');
      }
    }, error => {
      console.error('Fehler beim Speichern der Immobilie:', error);
      alert('Fehler beim Speichern der Immobilie.');
    });
  }
  
}
