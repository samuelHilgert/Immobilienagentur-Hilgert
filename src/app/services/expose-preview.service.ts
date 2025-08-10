import { Injectable } from '@angular/core';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ExposePreview } from '../models/expose-preview.model';
import { Firestore } from '@angular/fire/firestore';
import { FirebaseApp } from '@angular/fire/app';
 
@Injectable({ providedIn: 'root' })
export class ExposePreviewService {
  constructor(private firestore: Firestore, private app: FirebaseApp) {
    const opts = this.app.options as any;
    // console.log('[ExposePreviewService] FirebaseApp', {
    //   projectId: opts?.projectId,
    //   appId: opts?.appId,
    //   apiKey: String(opts?.apiKey || '').slice(0, 6) + '…',
    // });
  }

  private getDocRef(inquiryProcessId: string) {
    const ref = doc(this.firestore, 'expose-previews', inquiryProcessId);
    // console.log('[ExposePreviewService] doc path:', ref.path);
    return ref;
  }

// Rückgabetyp auf ExposePreview | null ändern
async getExposePreview(inquiryProcessId: string): Promise<ExposePreview | null> {
  // console.group('[ExposePreviewService] getExposePreview');
  // console.log('inquiryProcessId:', inquiryProcessId);

  const ref = this.getDocRef(inquiryProcessId);
  const snap = await getDoc(ref);

  // console.log('exists():', snap.exists());

  if (!snap.exists()) {
    // console.warn('⚠️ Kein Dokument unter:', ref.path);
    // console.groupEnd();
    return null; // << klarer „nicht vorhanden“-Wert
  }

  const data = snap.data() as ExposePreview;
  // console.log('data:', data);
  // console.groupEnd();
  return data;
}


  async setExposePreview(inquiryProcessId: string, preview: ExposePreview) {
    console.group('[ExposePreviewService] setExposePreview');
    console.log('inquiryProcessId:', inquiryProcessId, 'preview:', preview);
    const ref = this.getDocRef(inquiryProcessId);
    await setDoc(ref, preview, { merge: true });
    console.log('✅ setDoc merge OK');
    console.groupEnd();
  }

  async updateAccessLevel(inquiryProcessId: string, newLevel: string): Promise<void> {
    // console.group('[ExposePreviewService] updateAccessLevel');
    // console.log('inquiryProcessId:', inquiryProcessId, 'newLevel:', newLevel);
    const ref = this.getDocRef(inquiryProcessId);
    await updateDoc(ref, { exposeAccessLevel: newLevel });
    // console.log('✅ updateDoc OK');
    // console.groupEnd();
  }

  
}
