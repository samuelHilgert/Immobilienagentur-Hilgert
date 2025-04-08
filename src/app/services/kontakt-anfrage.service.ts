import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { environment } from '../../environments/environments';
import { KontaktAnfrage } from '../models/kontakt-anfrage.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class KontaktAnfrageService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);

  constructor(private http: HttpClient) {}

  async submitKontaktAnfrage(anfrage: KontaktAnfrage): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const ref = collection(this.db, 'kontakt-anfragen');
      const newDocRef = doc(ref);
      const customerId = newDocRef.id;

      const payload: KontaktAnfrage = {
        ...anfrage,
        customerId,
        creationDate: new Date().toISOString(),
      };

      await setDoc(newDocRef, payload);

      const phpEndpoint = 'https://hilgert-immobilien.de/sendKontaktAnfrageMail.php';
      await this.http.post(phpEndpoint, payload).toPromise();

      return { success: true, id: customerId };
    } catch (error) {
      console.error('Fehler beim Speichern oder Versenden:', error);
      return { success: false, error };
    }
  }
}
