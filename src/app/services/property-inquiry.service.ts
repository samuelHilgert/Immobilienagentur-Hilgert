
import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from '@angular/fire/firestore'; 
import { PropertyInquiryProcess } from '../models/property-inquiry-process.model';

@Injectable({ providedIn: 'root' })
export class PropertyInquiryService {
  constructor(private firestore: Firestore) {}

  async getProcessByCustomerAndProperty(customerId: string, propertyId: string): Promise<PropertyInquiryProcess | null> {
    const q = query(
      collection(this.firestore, 'property-inquiry-processes'),
      where('customerId', '==', customerId),
      where('propertyExternalId', '==', propertyId)
    );

    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as PropertyInquiryProcess;
  }

  async updateProcess(inquiryProcessId: string, data: Partial<PropertyInquiryProcess>): Promise<void> {
    const ref = doc(this.firestore, 'property-inquiry-processes', inquiryProcessId);
    await updateDoc(ref, data);
  }

        /**
   * Alle Prozesse mit inquiryProcessStatus == 'Anfrage' für eine Menge an propertyExternalIds.
   * Achtung: 'in' erlaubt max. 10 Werte -> wir chunken und mergen die Ergebnisse.
   */
        async findProcessesForPropertyIdsWithStatusAnfrage(
          propertyIds: string[]
        ): Promise<PropertyInquiryProcess[]> {
          if (!propertyIds.length) return [];
        
          const col = collection(this.firestore, 'property-inquiry-processes');
          const chunks = this.chunk(propertyIds, 10);
        
          const results: PropertyInquiryProcess[] = [];
          for (const ids of chunks) {
            const qy = query(
              col,
              where('inquiryProcessStatus', '==', 'Anfrage'),
              where('propertyExternalId', 'in', ids)
            );
            const snap = await getDocs(qy);
            results.push(...snap.docs.map(d => d.data() as PropertyInquiryProcess));
          }
        
          // Doppelte rausfiltern
          const byId = new Map(results.map(p => [p.inquiryProcessId, p]));
          return Array.from(byId.values());
        }
        
        private chunk<T>(arr: T[], size = 10): T[][] {
          const out: T[][] = [];
          for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
          return out;
        }
}
