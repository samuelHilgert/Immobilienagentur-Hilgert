import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { ImmobilienService } from './immobilien.service';
import { deleteDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { ExposeAnfrageDto } from '../models/expose-anfrage.model';
import { createInitialInquiryProcess } from '../factories/inquiry-process.factory';
import { createCustomerFromExposeAnfrage } from '../factories/customer.factory';
import { mapMarketingType } from '../factories/marketing-type.util';
import { createExposeAnswerMailPayload } from '../factories/expose-mail.factory';
import { PropertyInquiryProcess } from '../models/property-inquiry-process.model';

@Injectable({
  providedIn: 'root',
})
export class ExposeAnfrageService {
  public firestore: Firestore;

  constructor(
    private http: HttpClient,
    private immobilienService: ImmobilienService,
    firestore: Firestore
  ) {
    this.firestore = firestore; // 👉 manuell zuweisen
  }

  async submitExposeAnfrage(
    anfrage: ExposeAnfrageDto,
    sharedId: string
  ): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const exposeRef = doc(this.firestore, 'expose-anfragen', sharedId);
      const customerRef = doc(this.firestore, 'customers', sharedId);

      // ⏳ Expose-Anfrage speichern
      await setDoc(exposeRef, {
        ...anfrage,
        requestCustomerId: sharedId,
        creationDate: new Date().toISOString(),
      });

      const customer = createCustomerFromExposeAnfrage(anfrage, sharedId); // greift auf die factory zu für den Init des Objekts

      // 🧠 Nach erfolgreicher Kundenanlage / Anfrage:
      const inquiryProcessId = `${sharedId}_${anfrage.requestPropertyId}`;

      const process = createInitialInquiryProcess(anfrage, inquiryProcessId); // greift auf die factory zu für den Init des Objekts

      // 🔥 Firestore Save:
      const processRef = doc(
        this.firestore,
        'property-inquiry-processes',
        inquiryProcessId
      );
      await setDoc(processRef, process);

      await setDoc(customerRef, customer, { merge: true });

      // 🔎 Immobilie laden
      const immobilie = await this.immobilienService.getProperty(
        anfrage.requestPropertyId
      );

      // 📩 Interne Mail – jetzt mit autoExposeSend im Payload
      const internalMailEndpoint =
        'https://hilgert-immobilien.de/sendExposeAnfrageMail.php';

      await this.http
        .post(internalMailEndpoint, {
          ...anfrage,
          autoExposeSend: immobilie?.autoExposeSend || false,
        })
        .toPromise();

      // 🧾 Weitere Verarbeitung
      const marketingTypeText = mapMarketingType(
        immobilie?.marketingType || ''
      );

      const mailPayload = createExposeAnswerMailPayload(anfrage, immobilie); // greift auf die factory zu für den Init des Objekts

      console.log('[Auto-Versand] Immobilie:', immobilie);
      console.log('[Auto-Versand] autoExposeSend:', immobilie?.autoExposeSend);
      console.log('[Auto-Versand] Payload:', mailPayload);

      // 📩 Nur senden, wenn Auto-Versand aktiviert ist
      if (immobilie?.autoExposeSend) {
        setTimeout(async () => {
          try {
            await this.http
              .post(
                'https://hilgert-immobilien.de/sendExposeAntwortMail.php',
                mailPayload
              )
              .toPromise();

            // Hole den aktuellen Stand aus Firestore (um Änderungen nicht zu überschreiben)
            const latestProcessSnap = await getDoc(processRef);
            const latestProcess =
              latestProcessSnap.data() as PropertyInquiryProcess;

            // Update-Felder setzen
            latestProcess.exposeSent = new Date();
            latestProcess.inquiryProcessStatus = 'Exposé';
            latestProcess.lastUpdateDate = new Date();

          } catch (e) {
            console.error('Fehler beim Senden der Antwortmail', e);
          }
        }, 10000);
      } else {
        console.log(
          '✋ Automatischer Exposé-Versand deaktiviert für diese Immobilie.'
        );
      }

      // 🧹 Exposé-Anfrage nach 20s löschen
      setTimeout(async () => {
        try {
          console.log('Versuche zu löschen als UID:', sharedId);

          await deleteDoc(exposeRef);
        } catch (e) {
          console.warn('Expose-Anfrage konnte nicht gelöscht werden:', e);
        }
      }, 20000);

      return { success: true, id: sharedId };
    } catch (error) {
      console.error('❌ Fehler beim Verarbeiten der Anfrage:', error);
      return { success: false, error };
    }
  }

  // 🔐 Nur Admins können alle Anfragen zu einer Immobilie einsehen
  async getAnfragenByImmobilienId(
    immobilienId: string
  ): Promise<ExposeAnfrageDto[]> {
    const exposeRef = collection(this.firestore, 'expose-anfragen');
    const q = query(exposeRef, where('immobilienId', '==', immobilienId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as ExposeAnfrageDto);
  }
}
