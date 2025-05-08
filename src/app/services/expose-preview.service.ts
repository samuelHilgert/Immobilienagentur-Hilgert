// src/app/services/expose-preview.service.ts
import { Injectable } from '@angular/core';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getFirestore,
} from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { ExposePreview } from '../models/expose-preview.model';

@Injectable({
  providedIn: 'root',
})
export class ExposePreviewService {
  private db = getFirestore();

  constructor(private firebaseService: FirebaseService) {}

  private getDocRef(propertyExternalId: string) {
    return doc(this.db, 'expose-previews', propertyExternalId);
  }

  async getExposePreview(propertyExternalId: string): Promise<ExposePreview> {
    const ref = this.getDocRef(propertyExternalId);
    const snap = await getDoc(ref);
    return snap.exists()
      ? (snap.data() as ExposePreview)
      : { shortExposeAccess: [], extendedExposeAccess: [] };
  }

  async setExposePreview(propertyExternalId: string, preview: ExposePreview) {
    const ref = this.getDocRef(propertyExternalId);
    await setDoc(ref, preview, { merge: true });
  }

  async addInquiryAccess(
    propertyExternalId: string,
    inquiryProcessId: string,
    level: 'normal' | 'gekürzt' | 'erweitert'
  ) {
    const ref = this.getDocRef(propertyExternalId);
  
    // 🛠️ Sicherstellen, dass das Dokument existiert
    const docSnap = await getDoc(ref);
    if (!docSnap.exists()) {
      await setDoc(ref, { shortExposeAccess: [], extendedExposeAccess: [] }, { merge: true });
    }
  
    // Entfernen aus beiden Arrays
    await updateDoc(ref, {
      shortExposeAccess: arrayRemove(inquiryProcessId),
      extendedExposeAccess: arrayRemove(inquiryProcessId),
    });
  
    // Hinzufügen je nach Level
    if (level === 'gekürzt') {
      await updateDoc(ref, {
        shortExposeAccess: arrayUnion(inquiryProcessId),
      });
    } else if (level === 'erweitert') {
      await updateDoc(ref, {
        extendedExposeAccess: arrayUnion(inquiryProcessId),
      });
    }
  }
  
}
