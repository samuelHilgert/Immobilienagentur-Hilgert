// src/app/services/kontakt-anfrage.service.ts

import { Injectable } from '@angular/core';
import { KontaktAnfrage } from '../models/kontakt-anfrage.model';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class KontaktAnfrageService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);

  constructor(private http: HttpClient) {}

  async submitKontaktAnfrage(
    anfrage: KontaktAnfrage
  ): Promise<{ success: boolean; id?: string; mailSent?: boolean; error?: any }> {
    try {
      // 1. Firestore: Dokument anlegen
      const kontaktRef = collection(this.db, 'kontakt-anfragen');
      const newDocRef = doc(kontaktRef);
      const customerId = newDocRef.id;

      const payload: KontaktAnfrage = {
        ...anfrage,
        customerId,
        creationDate: new Date().toISOString()
      };

      await setDoc(newDocRef, payload);
      let mailSent = true;

      // 2. Mailversand (optional abfangen)
      try {
        await this.http
          .post(
            'https://us-central1-hilgert-immobilien.cloudfunctions.net/sendKontaktMail',
            payload
          )
          .toPromise();
      } catch (mailErr) {
        console.error('📧 Fehler beim Mailversand:', mailErr);
        mailSent = false;
      }

      // 3. Rückgabe
      return { success: true, id: customerId, mailSent };
    } catch (error) {
      console.error('❌ Fehler beim Speichern der Anfrage:', error);
      return { success: false, error };
    }
  }
}
