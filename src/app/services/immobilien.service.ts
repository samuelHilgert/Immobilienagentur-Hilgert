// src/app/services/immobilien.service.ts
import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Immobilie, WohnungDetails } from '../models/immobilie.model';

@Injectable({
  providedIn: 'root'
})
export class ImmobilienService {
  constructor(private firebaseService: FirebaseService) {}

  // Wohnung speichern
  async saveWohnung(immobilie: Immobilie, wohnungDetails: WohnungDetails): Promise<any> {
    try {
      // Immobiliendaten vorbereiten
      const immo = { ...immobilie };
      
      // Stellen sicher, dass propertyType und propertyStatus existieren
      // (diese scheinen in deinem Interface nicht definiert zu sein, werden aber verwendet)
      (immo as any).propertyType = 'APARTMENT';
      (immo as any).propertyStatus = 'ACTIVE';
      (immo as any).apartmentDetails = wohnungDetails;
      
      // In Firebase speichern
      return await this.firebaseService.saveProperty(immo);
    } catch (error) {
      console.error('Fehler beim Speichern der Wohnung:', error);
      return { success: false, error };
    }
  }

  // Haus speichern
  async saveHaus(immobilie: Immobilie, hausDetails: any): Promise<any> {
    try {
      const immo = { ...immobilie };
      (immo as any).propertyType = 'HOUSE';
      (immo as any).propertyStatus = 'ACTIVE';
      (immo as any).houseDetails = hausDetails;
      
      return await this.firebaseService.saveProperty(immo);
    } catch (error) {
      console.error('Fehler beim Speichern des Hauses:', error);
      return { success: false, error };
    }
  }

  // Grundstück speichern
  async saveGrundstueck(immobilie: Immobilie, grundstueckDetails: any): Promise<any> {
    try {
      const immo = { ...immobilie };
      (immo as any).propertyType = 'LAND';
      (immo as any).propertyStatus = 'ACTIVE';
      (immo as any).landDetails = grundstueckDetails;
      
      return await this.firebaseService.saveProperty(immo);
    } catch (error) {
      console.error('Fehler beim Speichern des Grundstücks:', error);
      return { success: false, error };
    }
  }

  // Medien hochladen
  async uploadMedia(file: File, externalId: string, type: 'image' | 'video'): Promise<any> {
    try {
      return await this.firebaseService.uploadMedia(file, externalId, type);
    } catch (error) {
      console.error('Fehler beim Hochladen des Mediums:', error);
      return { success: false, error };
    }
  }

  // Medien löschen
  async deleteMedia(mediaId: string): Promise<any> {
    try {
      return await this.firebaseService.deleteMedia(mediaId);
    } catch (error) {
      console.error('Fehler beim Löschen des Mediums:', error);
      return { success: false, error };
    }
  }

  // Titelbild festlegen
  async setTitleImage(mediaId: string, externalId: string): Promise<any> {
    try {
      return await this.firebaseService.setTitleImage(mediaId, externalId);
    } catch (error) {
      console.error('Fehler beim Festlegen des Titelbilds:', error);
      return { success: false, error: 'Methode noch nicht implementiert' };
    }
  }

  // Immobilie abrufen
  async getProperty(externalId: string): Promise<any> {
    try {
      return await this.firebaseService.getProperty(externalId);
    } catch (error) {
      console.error('Fehler beim Abrufen der Immobilie:', error);
      return { success: false, error };
    }
  }

  // Alle Immobilien abrufen
  async getProperties(filters?: any): Promise<any[]> {
    try {
      return await this.firebaseService.getProperties(filters);
    } catch (error) {
      console.error('Fehler beim Abrufen der Immobilien:', error);
      return [];
    }
  }

  // Alle Immobilien abrufen (alte Methode für Kompatibilität)
  getImmobilien() {
    // 'this' in lokaler Variable speichern
    const self = this;
    
    // Wandelt das Promise in ein Observable um für Kompatibilität
    return {
      subscribe(options: { next: (data: any) => void, error?: (error: any) => void }) {
        self.getProperties()  // Verwende 'self' statt 'this'
          .then(properties => {
            if (options.next) options.next(properties);
          })
          .catch(error => {
            if (options.error) options.error(error);
          });
        
        // Dummy-Unsubscribe-Funktion zurückgeben
        return { unsubscribe: () => {} };
      }
    };
  }

  // Medien für eine Immobilie abrufen (alt)
  getMediaByExternalId(externalId: string) {
    // 'this' in lokaler Variable speichern
    const self = this;
    
    // Methode im FirebaseService erstellen oder erweitern
    return {
      subscribe(options: { next: (data: any) => void, error?: (error: any) => void }) {
        self.firebaseService.getMediaForProperty(externalId)  // Verwende 'self' statt 'this'
          .then(media => {
            if (options.next) options.next(media);
          })
          .catch(error => {
            if (options.error) options.error(error);
          });
        
        // Dummy-Unsubscribe-Funktion zurückgeben
        return { unsubscribe: () => {} };
      }
    };
  }
}