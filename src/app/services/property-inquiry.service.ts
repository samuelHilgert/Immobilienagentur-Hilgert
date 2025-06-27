
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

  
}
