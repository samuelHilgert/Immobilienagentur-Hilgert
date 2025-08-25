
import { collection, getDocs, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  docData,
  docSnapshots,
  collectionData,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ViewingConfirmationService {
  private MAIL_ENDPOINT =
    'https://hilgert-immobilien.de/sendViewingConfirmationMail.php';

  constructor(private firestore: Firestore, private http: HttpClient) {}

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

  private roundtripDate(d: any): Date | null {
    if (!d) return null;
    // Firestore Timestamp?
    if (typeof d === 'object' && 'toDate' in d) {
      try {
        return (d as any).toDate();
      } catch {
        /* noop */
      }
    }
    try {
      return new Date(d);
    } catch {
      return null;
    }
  }

  private fmt(dt: Date | null): string {
    // ISO für PHP (oder du nutzt de-DE hier; PHP formatiert unten erneut)
    return dt ? dt.toISOString() : '';
  }

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

        await setDoc(
          this.ref(newId),
          { ...payloadBase, ...preserved },
          { merge: false }
        );
        await deleteDoc(this.ref(oldId));
        return newId;
      } else {
        await setDoc(this.ref(newId), payloadBase, { merge: true });
        return newId;
      }
    }

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

  async deleteForAppointment(appt: ViewingAppointment): Promise<void> {
    if (!appt.viewingConfirmationId) return;
    await deleteDoc(this.ref(appt.viewingConfirmationId));
  }

  async get(id: string): Promise<ViewingConfirmation | null> {
    const snap = await getDoc(this.ref(id));
    return snap.exists() ? (snap.data() as ViewingConfirmation) : null;
  }

  /**
   * Kunde bestätigt:
   * - Speichern (accepted/confirmedAt/ua/note)
   * - Mail senden (alle Felder)
   * - sentMailConfirmation setzen
   * - nach 3s Link sperren
   */
  async confirm(viewingConfirmationId: string, note?: string) {
    // 1) Sofort speichern
    await updateDoc(this.ref(viewingConfirmationId), {
      acceptedConditions: true,
      confirmedAt: Timestamp.now(),
      confirmUa: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      note: note ?? null,
    });

    // 2) Frische Daten holen
    const snap = await getDoc(this.ref(viewingConfirmationId));
    const vc = snap.exists() ? (snap.data() as ViewingConfirmation) : null;

    // 3) Mail senden (soft-fail)
    if (vc) {
      const viewingDateMs =
        this.roundtripDate(vc.viewingDate as any)?.getTime() ?? 0;
      const confirmedAtMs =
        this.roundtripDate(vc.confirmedAt as any)?.getTime() ?? 0;

      const payload = {
        viewingConfirmationId: vc.viewingConfirmationId,
        inquiryProcessId: vc.inquiryProcessId,
        customerId: vc.customerId ?? '',
        propertyExternalId: vc.propertyExternalId ?? '',
        salutation: vc.salutation ?? '',
        firstName: vc.firstName ?? '',
        lastName: vc.lastName ?? '',
        viewingType: vc.viewingType ?? '',
        viewingDateMs, // ⇦ nur ms senden
        confirmedAtMs, // ⇦ nur ms senden
        title: vc.title ?? '',
        street: vc.street ?? '',
        houseNumber: vc.houseNumber ?? '',
        postcode: vc.postcode ?? '',
        city: vc.city ?? '',
        courtage: vc.courtage ?? '',
        acceptedConditions: !!vc.acceptedConditions,
        confirmUa: vc.confirmUa ?? '',
        note: vc.note ?? '',
      };

      try {
        await this.http.post(this.MAIL_ENDPOINT, payload).toPromise();
        await updateDoc(this.ref(viewingConfirmationId), {
          sentMailConfirmation: Timestamp.now(),
        });
      } catch (e) {
        console.error('Mailversand Viewing-Confirmation fehlgeschlagen:', e);
      }
    }

    // 4) Nach 3 Sekunden sperren
    setTimeout(async () => {
      try {
        await updateDoc(this.ref(viewingConfirmationId), { blocked: true });
      } catch (e) {
        console.error('Konnte nachträgliches Sperren nicht durchführen:', e);
      }
    }, 3000);
  }

  async markMailSent(viewingConfirmationId: string, sentAt: Date = new Date()) {
    await updateDoc(this.ref(viewingConfirmationId), {
      sentMailConfirmation: Timestamp.fromDate(sentAt),
    });
  }

  async setBlockedForProcess(
    inquiryProcessId: string,
    blocked: boolean
  ): Promise<void> {
    const colRef = collection(this.firestore, 'viewing-confirmations');
    const q = query(colRef, where('inquiryProcessId', '==', inquiryProcessId));
    const snap = await getDocs(q);
    if (snap.empty) return;
    await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { blocked })));
  }

  // Methode um zu überwachen, ob der Termin bereits bestätigt wurde
  watch(viewingConfirmationId: string): Observable<ViewingConfirmation | null> {
    return docSnapshots(this.ref(viewingConfirmationId)).pipe(
      map((s) => (s.exists() ? (s.data() as ViewingConfirmation) : null))
    );
  }

  /** Alle offenen (nicht bestätigten) Viewing-Confirmations, aufsteigend nach viewingDate */
  pending(limitCount = 50): Observable<ViewingConfirmation[]> {
    const col = collection(this.firestore, 'viewing-confirmations');
    const qy = query(
      col,
      where('acceptedConditions', '==', false),
      orderBy('viewingDate', 'asc'),
      limit(limitCount)
    );
    return collectionData(qy, { idField: 'viewingConfirmationId' }).pipe(
      map(rows => rows as ViewingConfirmation[])
    );
  }
}
