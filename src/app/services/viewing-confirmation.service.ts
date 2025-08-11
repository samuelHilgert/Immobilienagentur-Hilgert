import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Timestamp } from 'firebase/firestore';
import { ViewingConfirmation } from '../models/viewing-confirmation.model';

@Injectable({ providedIn: 'root' })
export class ViewingConfirmationService {
  constructor(private firestore: Firestore) {}

  private ref(id: string) {
    return doc(this.firestore, 'viewing-confirmations', id);
  }

  async get(id: string): Promise<ViewingConfirmation | null> {
    const snap = await getDoc(this.ref(id));
    return snap.exists() ? (snap.data() as ViewingConfirmation) : null;
  }

  // Beim Versenden der Mail (intern) anlegen/überschreiben
  async upsertLink(payload: {
    inquiryProcessId: string;
    customerId: string;
    propertyExternalId: string;
    appointmentDate?: Date;
    addressLine?: string;
    zip?: string;
    city?: string;
  }): Promise<void> {
    const data: ViewingConfirmation = {
      inquiryProcessId: payload.inquiryProcessId,
      customerId: payload.customerId,
      propertyExternalId: payload.propertyExternalId,
      appointmentDate: payload.appointmentDate ? Timestamp.fromDate(payload.appointmentDate) : null,
      addressLine: payload.addressLine ?? '',
      zip: payload.zip ?? '',
      city: payload.city ?? '',
      blocked: false,
      createdAt: Timestamp.now(),
    };
    await setDoc(this.ref(payload.inquiryProcessId), data, { merge: true });
  }

  // Auf öffentlicher Seite speichern
  async confirm(inquiryProcessId: string, note?: string) {
    await updateDoc(this.ref(inquiryProcessId), {
      acceptedGuidelines: true,
      confirmedAt: Timestamp.now(),
      confirmUa: navigator.userAgent,
      note: note ?? null,
    });
  }
}
