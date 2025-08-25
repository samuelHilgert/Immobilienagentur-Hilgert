// src/app/services/immobilien.service.ts
import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Immobilie, WohnungDetails } from '../models/immobilie.model';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MediaAttachment } from '../models/media.model';
import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ImmobilienService {
  private baseUrl = '/api/immobilien';

  constructor(
    private firestore: Firestore,
    private firebaseService: FirebaseService,
    private http: HttpClient
  ) {}

  // Wohnung speichern
  async saveWohnung(
    immobilie: Immobilie,
    wohnungDetails: WohnungDetails
  ): Promise<any> {
    try {
      // Immobiliendaten vorbereiten
      const immo = { ...immobilie };
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
      (immo as any).houseDetails = hausDetails;

      return await this.firebaseService.saveProperty(immo);
    } catch (error) {
      console.error('Fehler beim Speichern des Hauses:', error);
      return { success: false, error };
    }
  }

  // Grundstück speichern
  async saveGrundstueck(
    immobilie: Immobilie,
    grundstueckDetails: any
  ): Promise<any> {
    try {
      const immo = { ...immobilie };
      (immo as any).landDetails = grundstueckDetails;

      return await this.firebaseService.saveProperty(immo);
    } catch (error) {
      console.error('Fehler beim Speichern des Grundstücks:', error);
      return { success: false, error };
    }
  }

  // Medien hochladen
  async uploadMedia(
    file: File,
    externalId: string,
    type: 'image' | 'video'
  ): Promise<any> {
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
      subscribe(options: {
        next: (data: any) => void;
        error?: (error: any) => void;
      }) {
        self
          .getProperties() // Verwende 'self' statt 'this'
          .then((properties) => {
            if (options.next) options.next(properties);
          })
          .catch((error) => {
            if (options.error) options.error(error);
          });

        // Dummy-Unsubscribe-Funktion zurückgeben
        return { unsubscribe: () => {} };
      },
    };
  }

  // Medien für eine Immobilie abrufen (alt)
  getMediaByExternalId(externalId: string) {
    // 'this' in lokaler Variable speichern
    const self = this;

    // Methode im FirebaseService erstellen oder erweitern
    return {
      subscribe(options: {
        next: (data: any) => void;
        error?: (error: any) => void;
      }) {
        self.firebaseService
          .getMediaForProperty(externalId) // Verwende 'self' statt 'this'
          .then((media) => {
            if (options.next) options.next(media);
          })
          .catch((error) => {
            if (options.error) options.error(error);
          });

        // Dummy-Unsubscribe-Funktion zurückgeben
        return { unsubscribe: () => {} };
      },
    };
  }

  // Exposé-Formular ruft Immobilie per ID aus Firebase ab
  async getImmobilieById(id: string): Promise<Immobilie> {
    try {
      const result = await this.getProperty(id); // ✅ nutzt interne Firebase-Methode
      if (!result || result.success === false) {
        throw new Error(`Immobilie mit ID ${id} nicht gefunden.`);
      }
      return result as Immobilie;
    } catch (error) {
      console.error('Fehler beim Laden der Immobilie mit ID:', id, error);
      throw error;
    }
  }

  // Exposé-Formular ruft Immobilie mit WohnungDetails per ID aus Firebase ab
  async getWohnungById(id: string): Promise<WohnungDetails> {
    try {
      const result = await this.getProperty(id); // ✅ nutzt interne Firebase-Methode
      if (!result || result.success === false) {
        throw new Error(`Immobilie mit ID ${id} nicht gefunden.`);
      }
      return result as WohnungDetails;
    } catch (error) {
      console.error('Fehler beim Laden der Immobilie mit ID:', id, error);
      throw error;
    }
  }

  // Neue öffentliche Methode, um Medien zu laden
  async getMediaForImmobilie(id: string): Promise<MediaAttachment[]> {
    try {
      return await this.firebaseService.getMediaForProperty(id);
    } catch (error) {
      console.error('Fehler beim Laden der Medien:', error);
      return [];
    }
  }

  async getNextIndexId(): Promise<number> {
    try {
      const all = await this.firebaseService.getProperties();

      const maxIndex = all
        .map((immo) => Number(immo.indexId)) // in Zahl konvertieren
        .filter((id) => !isNaN(id) && id >= 0) // nur gültige, positive Zahlen
        .reduce((max, id) => (id > max ? id : max), 0); // Maximum finden

      return maxIndex + 2;
    } catch (error) {
      console.error('Fehler beim Ermitteln der höchsten indexId:', error);
      return 2; // Fallback bei leerer Liste = erster Wert ist 2
    }
  }

  // 🔢 Zufällige 5-stellige ID erzeugen
  private generateRandomId(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  // ✅ Generiert ID & prüft auf Eindeutigkeit
  async generateUniqueExternalId(): Promise<string> {
    let uniqueId = '';
    let exists = true;

    while (exists) {
      const potentialId = this.generateRandomId();
      const result = await this.getProperty(potentialId);

      if (!result || result.success === false) {
        uniqueId = potentialId;
        exists = false;
      }
    }

    return uniqueId;
  }

  // Immobilie aus Datenbank vollständig löschen können
  async deleteImmobilie(
    externalId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 🔸 1. Alle zugehörigen Medien laden
      const mediaList = await this.firebaseService.getMediaForProperty(
        externalId
      );

      // 🔸 2. Alle Medien löschen
      for (const media of mediaList) {
        await this.firebaseService.deleteMedia(media.id);
      }

      // 🔸 3. Immobilie selbst löschen
      await this.firebaseService.deleteProperty(externalId);

      // 🔸 4. Optional: Storage-Ordner löschen (nur falls gewünscht)
      await this.firebaseService.deleteStorageFolder(
        `property-media/${externalId}`
      );

      return { success: true };
    } catch (error) {
      console.error('Fehler beim Löschen der Immobilie:', error);
      return { success: false, error: 'Fehler beim Löschen' };
    }
  }

  // Upload für Expose Pdfs im Dashboard
  // Upload für Exposé-PDFs im Dashboard + Speichern in Firestore
  async uploadExposePdf(
    file: File,
    externalId: string
  ): Promise<{ success: boolean; url?: string }> {
    try {
      const timestamp = new Date().getTime();
      const filename = `${externalId}_expose_${timestamp}.pdf`;

      const storageRef = ref(
        this.firebaseService.storage,
        `expose-pdf/${externalId}/${filename}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 🔹 PDF-Link in Immobilie speichern
      const propertyRef = doc(
        this.firebaseService.db,
        'properties',
        externalId
      );
      await updateDoc(propertyRef, {
        exposePdfUrl: downloadURL,
      });

      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Fehler beim Hochladen des Exposé-PDF:', error);
      return { success: false };
    }
  }

  /**
   * Prüft, ob ein Objektnachweis im Storage für die angegebene Immobilie existiert.
   */
  async checkObjektnachweisExists(
    externalId: string
  ): Promise<{ exists: boolean; url?: string }> {
    try {
      const filePath = `forms/objektnachweis/${externalId}/objektnachweis-${externalId}.pdf`;
      const fileRef = ref(this.firebaseService.storage, filePath);

      const url = await getDownloadURL(fileRef);
      return { exists: true, url };
    } catch (error) {
      return { exists: false };
    }
  }

  async updateProperty(
    externalId: string,
    updates: Partial<Immobilie>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Referenz zum Dokument
      const propertyRef = doc(
        this.firebaseService.db,
        'properties',
        externalId
      );

      // lastModificationDate automatisch setzen
      updates.lastModificationDate = new Date().toISOString();

      // Firestore aktualisieren
      await updateDoc(propertyRef, updates);

      return { success: true };
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Immobilie:', error);
      return { success: false, error: 'Aktualisierung fehlgeschlagen' };
    }
  }

  /**
   * Lädt eine PDF-Datei als Objektnachweis hoch und gibt den Download-Link zurück.
   */
  async uploadObjektnachweis(
    file: File,
    externalId: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!file || !externalId) {
      return { success: false, error: 'Datei oder External ID fehlt' };
    }

    try {
      const storagePath = `forms/objektnachweis/${externalId}/objektnachweis-${externalId}.pdf`;

      const storageRef = ref(this.firebaseService.storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      return { success: true, url: downloadUrl };
    } catch (error: any) {
      console.error('Fehler beim Hochladen des Objektnachweises:', error);
      return { success: false, error: error.message || 'Unbekannter Fehler' };
    }
  }

  deleteStorageFolder(path: string): Promise<void> {
    return this.firebaseService.deleteStorageFolder(path);
  }

  /** externalIds aller Properties mit Status 'Angebot' */
  async listExternalIdsWithStatusAngebot(): Promise<string[]> {
    const col = collection(this.firestore, 'properties');
    const qy = query(col, where('propertyStatus', '==', 'Angebot'));
    const snap = await getDocs(qy);
    return snap.docs
      .map((d) => d.id || (d.data() as Immobilie).externalId)
      .filter((id): id is string => !!id);
  }
}
