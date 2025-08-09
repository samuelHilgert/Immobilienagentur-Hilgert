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
import { Timestamp } from 'firebase/firestore';

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
    console.group('[ExposeAnfrageService] submitExposeAnfrage');
    try {
      // 1) Grund-Refs
      const exposeRef   = doc(this.firestore, 'expose-anfragen', sharedId);
      const customerRef = doc(this.firestore, 'customers',        sharedId);
  
      // 2) Anfrage speichern
      await setDoc(exposeRef, {
        ...anfrage,
        requestCustomerId: sharedId,
        creationDate: new Date().toISOString(),
      });
      console.log('✅ expose-anfragen setDoc OK');
  
      // 3) Customer + Process vorbereiten
      const customer = createCustomerFromExposeAnfrage(anfrage, sharedId);
      const cleanPropertyId = String(anfrage.requestPropertyId).trim();
      const inquiryProcessId = `${sharedId}_${cleanPropertyId}`;
      console.log('sharedId:', sharedId);
      console.log('requestPropertyId (raw):', anfrage.requestPropertyId, 'typeof:', typeof anfrage.requestPropertyId);
      console.log('cleanPropertyId:', cleanPropertyId);
      console.log('inquiryProcessId (Doc-ID):', inquiryProcessId);
  
      const process = createInitialInquiryProcess(anfrage, inquiryProcessId);
      const processRef = doc(this.firestore, 'property-inquiry-processes', inquiryProcessId);
  
      // 4) Expose-Preview schreiben (entscheidend für dein Preview)
      const exposePreviewRef = doc(this.firestore, 'expose-previews', inquiryProcessId);
      console.log('exposePreviewRef.path:', exposePreviewRef.path);
  
      // parallel speichern
      await Promise.all([
        setDoc(processRef, process),
        setDoc(customerRef, customer, { merge: true }),
        setDoc(exposePreviewRef, {
          exposeAccessLevel: 'normal',
          customerId: sharedId,
          propertyExternalId: cleanPropertyId,
          salutation: anfrage.salutation,
          firstName: anfrage.firstName,
          lastName: anfrage.lastName,
        }, { merge: true }),
      ]);
  
      console.log('✅ process/customer/preview setDoc OK');
  
      // 5) Sofort: Preview-Dokument verifizieren
      const verifySnap = await getDoc(exposePreviewRef);
      console.log('verify exists():', verifySnap.exists(), 'data:', verifySnap.data());
      if (!verifySnap.exists()) {
        throw new Error('Expose-Preview konnte nicht verifiziert werden (exists=false).');
      }
  
      // 6) Immobilie laden (für Mailpayload etc.)
      const immobilie = await this.immobilienService.getProperty(cleanPropertyId);
  
      // 7) Interne Mail (unverändert)
      await this.http.post('https://hilgert-immobilien.de/sendExposeAnfrageMail.php', {
        ...anfrage,
        autoExposeSend: immobilie?.autoExposeSend || false,
        propertyTitle: immobilie?.title || '',
      }).toPromise();
  
      // 8) Optional: Auto-Expose-Mail
      if (immobilie?.autoExposeSend) {
        await this.sendExposeAndUpdateProcess(anfrage, immobilie, processRef);
      } else {
        console.log('✋ Automatischer Exposé-Versand deaktiviert für diese Immobilie.');
      }
  
      // 9) Cleanup: Anfrage nach 20s löschen (kann so bleiben)
      setTimeout(async () => {
        try {
          console.log('🧹 Lösche expose-anfragen Doc:', sharedId);
          await deleteDoc(exposeRef);
        } catch (e) {
          console.warn('Expose-Anfrage konnte nicht gelöscht werden:', e);
        }
      }, 20000);
  
      console.groupEnd();
      return { success: true, id: sharedId };
  
    } catch (error) {
      console.error('❌ Fehler beim Verarbeiten der Anfrage:', error);
      console.groupEnd();
      return { success: false, error };
    }
  }
  

  private async sendExposeAndUpdateProcess(
    anfrage: ExposeAnfrageDto,
    immobilie: any,
    processRef: any
  ): Promise<void> {
    const mailPayload = createExposeAnswerMailPayload(anfrage, immobilie);
    console.log('[Auto-Versand] Payload:', mailPayload);

    console.log('[DEBUG] Expose-Mail-Payload:', mailPayload);
    console.log('[DEBUG] Exposé-Link:', mailPayload.exposeUrl);

    try {
      await this.http
        .post(
          'https://hilgert-immobilien.de/sendExposeAntwortMail.php',
          mailPayload
        )
        .toPromise();

      const now = Timestamp.now();
      await setDoc(
        processRef,
        {
          exposeSent: now,
          inquiryProcessStatus: 'Exposé',
          lastUpdateDate: now,
        },
        { merge: true }
      );

      console.log('✅ exposeSent erfolgreich gespeichert:', now.toDate());
    } catch (e) {
      let errorMessage = 'Unbekannter Fehler';

      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      } else {
        errorMessage = JSON.stringify(e);
      }

      console.error('❌ Fehler beim Senden oder Speichern:', errorMessage);

      await setDoc(
        processRef,
        {
          exposeSent: null,
          exposeError: errorMessage,
          lastUpdateDate: Timestamp.now(),
        },
        { merge: true }
      );
    }
  }

  // async submitExposeAnfrage(
  //   anfrage: ExposeAnfrageDto,
  //   sharedId: string
  // ): Promise<{ success: boolean; id?: string; error?: any }> {
  //   try {
  //     const exposeRef = doc(this.firestore, 'expose-anfragen', sharedId);
  //     const customerRef = doc(this.firestore, 'customers', sharedId);

  //     // ⏳ Expose-Anfrage speichern
  //     await setDoc(exposeRef, {
  //       ...anfrage,
  //       requestCustomerId: sharedId,
  //       creationDate: new Date().toISOString(),
  //     });

  //     const customer = createCustomerFromExposeAnfrage(anfrage, sharedId); // greift auf die factory zu für den Init des Objekts

  //     // 🧠 Nach erfolgreicher Kundenanlage / Anfrage:
  //     const inquiryProcessId = `${sharedId}_${anfrage.requestPropertyId}`;

  //     const process = createInitialInquiryProcess(anfrage, inquiryProcessId); // greift auf die factory zu für den Init des Objekts

  //     // 🔥 Firestore Save:
  //     const processRef = doc(
  //       this.firestore,
  //       'property-inquiry-processes',
  //       inquiryProcessId
  //     );
  //     await setDoc(processRef, process);

  //     await setDoc(customerRef, customer, { merge: true });

  //     // 🔎 Immobilie laden
  //     const immobilie = await this.immobilienService.getProperty(
  //       anfrage.requestPropertyId
  //     );

  //     // 📩 Interne Mail – jetzt mit autoExposeSend im Payload
  //     const internalMailEndpoint =
  //       'https://hilgert-immobilien.de/sendExposeAnfrageMail.php';

  //     await this.http
  //       .post(internalMailEndpoint, {
  //         ...anfrage,
  //         autoExposeSend: immobilie?.autoExposeSend || false,
  //       })
  //       .toPromise();

  //     // 🧾 Weitere Verarbeitung
  //     const marketingTypeText = mapMarketingType(
  //       immobilie?.marketingType || ''
  //     );

  //     const mailPayload = createExposeAnswerMailPayload(anfrage, immobilie); // greift auf die factory zu für den Init des Objekts

  //     console.log('[Auto-Versand] Immobilie:', immobilie);
  //     console.log('[Auto-Versand] autoExposeSend:', immobilie?.autoExposeSend);
  //     console.log('[Auto-Versand] Payload:', mailPayload);

  //     // 📩 Nur senden, wenn Auto-Versand aktiviert ist
  //     if (immobilie?.autoExposeSend) {
  //       setTimeout(async () => {
  //         try {
  //           await this.http
  //             .post(
  //               'https://hilgert-immobilien.de/sendExposeAntwortMail.php',
  //               mailPayload
  //             )
  //             .toPromise();

  //           const now = new Date().toISOString();

  //           await setDoc(
  //             processRef,
  //             {
  //               exposeSent: now,
  //               inquiryProcessStatus: 'Exposé',
  //               lastUpdateDate: now,
  //             },
  //             { merge: true }
  //           );

  //         } catch (e) {
  //           console.error('Fehler beim Senden der Antwortmail', e);
  //         }
  //       }, 10000);
  //     } else {
  //       console.log(
  //         '✋ Automatischer Exposé-Versand deaktiviert für diese Immobilie.'
  //       );
  //     }

  //     // 🧹 Exposé-Anfrage nach 20s löschen
  //     setTimeout(async () => {
  //       try {
  //         console.log('gelöscht als UID:', sharedId);

  //         await deleteDoc(exposeRef);
  //       } catch (e) {
  //         console.warn('Expose-Anfrage konnte nicht gelöscht werden:', e);
  //       }
  //     }, 20000);

  //     return { success: true, id: sharedId };
  //   } catch (error) {
  //     console.error('❌ Fehler beim Verarbeiten der Anfrage:', error);
  //     return { success: false, error };
  //   }
  // }
  //
  //

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
