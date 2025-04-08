import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { environment } from '../../environments/environments';
import { ExposeAnfrage } from '../models/expose-anfrage.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExposeAnfrageService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);

  constructor(private http: HttpClient) {}

  async submitExposeAnfrage(anfrage: ExposeAnfrage): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const exposeRef = collection(this.db, 'expose-anfragen');
      const newDocRef = doc(exposeRef);
      const customerId = newDocRef.id;

      const payload: ExposeAnfrage = {
        ...anfrage,
        customerId,
        creationDate: new Date().toISOString(),
      };

      await setDoc(newDocRef, payload);

      const phpEndpoint = 'https://hilgert-immobilien.de/sendExposeAnfrageMail.php';
      await this.http.post(phpEndpoint, payload).toPromise();

      return { success: true, id: customerId };
    } catch (error) {
      console.error('Fehler beim Speichern oder Versenden:', error);
      return { success: false, error };
    }
  }
}
