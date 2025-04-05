// src/app/services/expose-anfrage.service.ts

import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { environment } from '../../environments/environments';
import { ExposeAnfrage } from '../models/expose-anfrage.model';

@Injectable({
  providedIn: 'root'
})
export class ExposeAnfrageService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);

  constructor() {}

  async submitExposeAnfrage(anfrage: ExposeAnfrage): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const exposeRef = collection(this.db, 'expose-anfragen');
  
      const newDocRef = doc(exposeRef); // Firestore erzeugt ID für dich
      const customerId = newDocRef.id;
  
      const payload: ExposeAnfrage = {
        ...anfrage,
        customerId,
        creationDate: new Date().toISOString()
      };
  
      await setDoc(newDocRef, payload);
  
      return { success: true, id: customerId };
    } catch (error) {
      console.error('Fehler beim Speichern der Exposé-Anfrage:', error);
      return { success: false, error };
    }
  }
  
}
