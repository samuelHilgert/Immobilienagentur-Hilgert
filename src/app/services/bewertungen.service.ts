import { Injectable } from '@angular/core';
import { Bewertung } from '../models/bewertung.model';
import { FirebaseService } from './firebase.service';
import { collection, doc, setDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class BewertungenService {
  constructor(private firebase: FirebaseService) {}

  async saveBewertung(bewertung: Bewertung): Promise<any> {
    try {
      const bewertungId = Date.now().toString();
      bewertung.bewertungId = bewertungId;
      bewertung.creationDate = new Date();

      const ref = doc(this.firebase.db, 'bewertungen', bewertungId);
      await setDoc(ref, bewertung);

      return { success: true, id: bewertungId };
    } catch (error) {
      console.error('Fehler beim Speichern der Bewertung:', error);
      return { success: false, error };
    }
  }
}
