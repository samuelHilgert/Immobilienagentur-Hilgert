// viewing-confirmation.service.ts
import { Injectable } from '@angular/core';
import { ViewingConfirmation } from '../models/viewing-confirmation.model';
import {
  PropertyInquiryProcess,
  ViewingAppointment,
} from '../models/property-inquiry-process.model';
import { Customer } from '../models/customer.model';
import { Immobilie } from '../models/immobilie.model';
import {
  Firestore,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  Timestamp,
} from '@angular/fire/firestore';
import { collection, getDocs, query, where } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class ViewingConfirmationService {
  constructor(private firestore: Firestore) {}

  private ref(id: string) {
    return doc(this.firestore, 'viewing-confirmations', id);
  }

  private buildId(
    customerId: string,
    propertyExternalId: string,
    viewingDate: Date
  ) {
    return `${customerId}_${propertyExternalId}_${viewingDate.getTime()}`;
  }

  /**
   * Upsert für GENAU EINEN Termin.
   * - Erstellt bei Bedarf ein neues VC-Dokument (inkl. ID-Generierung),
   * - aktualisiert es sonst,
   * - verschiebt (rename) bei Datumsänderung (altes löschen, neues anlegen).
   * Gibt immer die gültige viewingConfirmationId zurück (neu oder unverändert).
   */
  async upsertForAppointment(
    process: PropertyInquiryProcess,
    customer: Customer,
    immobilie: Immobilie,
    appt: ViewingAppointment
  ): Promise<string | null> {
    if (!appt.viewingDate) return null;

    const newId = this.buildId(
      process.customerId,
      process.propertyExternalId,
      new Date(appt.viewingDate)
    );

    const payloadBase = {
      viewingConfirmationId: newId,
      inquiryProcessId: process.inquiryProcessId,
      customerId: process.customerId,
      propertyExternalId: process.propertyExternalId,

      salutation: customer.salutation,
      firstName: customer.firstName,
      lastName: customer.lastName,

      viewingType: appt.viewingType,
      viewingDate: Timestamp.fromDate(new Date(appt.viewingDate)) as any,

      title: immobilie.title ?? '',
      street: immobilie.street ?? '',
      houseNumber: immobilie.houseNumber ?? '',
      postcode: immobilie.postcode ?? '',
      city: immobilie.city ?? '',
      courtage: immobilie.courtage ?? '',

      blocked: process.inquiryProcessStatus === 'Ausgeschieden',
      creationDate: new Date().toISOString(),
    };

    if (appt.viewingConfirmationId) {
      const oldId = appt.viewingConfirmationId;

      if (oldId !== newId) {
        // 1) Alte Daten holen, um Kundenfelder zu bewahren
        const oldSnap = await getDoc(this.ref(oldId));
        const preserved = oldSnap.exists()
          ? {
              acceptedConditions: oldSnap.data()['acceptedConditions'] ?? false,
              confirmedAt: oldSnap.data()['confirmedAt'] ?? null,
              confirmUa: oldSnap.data()['confirmUa'] ?? null,
              note: oldSnap.data()['note'] ?? null,
              sentMailConfirmation:
                oldSnap.data()['sentMailConfirmation'] ?? null,
            }
          : {
              acceptedConditions: false,
              confirmedAt: null,
              confirmUa: null,
              note: null,
              sentMailConfirmation: null,
            };

        // 2) Neues Doc schreiben (sauberer Neuaufbau)
        await setDoc(
          this.ref(newId),
          { ...payloadBase, ...preserved },
          { merge: false }
        );

        // 3) Altes löschen
        await deleteDoc(this.ref(oldId));

        return newId;
      } else {
        // Update: Kundenfelder NICHT überschreiben
        await setDoc(this.ref(newId), payloadBase, { merge: true });
        return newId;
      }
    }

    // NEU-Anlage
    await setDoc(
      this.ref(newId),
      {
        ...payloadBase,
        acceptedConditions: false,
        confirmedAt: null,
        confirmUa: null,
        note: null,
        sentMailConfirmation: null,
      },
      { merge: false }
    );

    return newId;
  }

  /** Löscht das VC-Dokument zu einem Termin (falls ID vorhanden). */
  async deleteForAppointment(appt: ViewingAppointment): Promise<void> {
    if (!appt.viewingConfirmationId) return;
    await deleteDoc(this.ref(appt.viewingConfirmationId));
  }

  // ⬇️ Für die öffentliche Seite:
  async get(id: string): Promise<ViewingConfirmation | null> {
    const snap = await getDoc(this.ref(id));
    return snap.exists() ? (snap.data() as ViewingConfirmation) : null;
  }

  // ⬇️ Bestätigung durch den Kunden (per ViewingConfirmationId!)
  async confirm(viewingConfirmationId: string, note?: string) {
    // 1) Sofort die Bestätigung speichern
    await updateDoc(this.ref(viewingConfirmationId), {
      acceptedConditions: true,
      confirmedAt: Timestamp.now(),
      confirmUa: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      note: note ?? null,
    });

    // 2) Nach 3 Sekunden sperren
    setTimeout(async () => {
      try {
        await updateDoc(this.ref(viewingConfirmationId), { blocked: true });
      } catch (e) {
        // optional: Logging oder Monitoring
        console.error('Konnte nachträgliches Sperren nicht durchführen:', e);
      }
    }, 3000);
  }

  async markMailSent(viewingConfirmationId: string, sentAt: Date = new Date()) {
    await updateDoc(this.ref(viewingConfirmationId), {
      sentMailConfirmation: Timestamp.fromDate(sentAt),
    });
  }

  /** Setzt blocked für alle Viewing-Confirmations eines inquiryProcessId. */
  async setBlockedForProcess(
    inquiryProcessId: string,
    blocked: boolean
  ): Promise<void> {
    const colRef = collection(this.firestore, 'viewing-confirmations');
    const q = query(colRef, where('inquiryProcessId', '==', inquiryProcessId));
    const snap = await getDocs(q);

    if (snap.empty) return;

    // Parallel updaten
    await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { blocked })));
  }
}
