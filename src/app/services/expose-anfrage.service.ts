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
import { Customer } from '../models/customer.model';
import { Immobilie } from '../models/immobilie.model';

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

  async submitExposeAnfrage(anfrage: ExposeAnfrageDto, sharedId: string) {
    console.group('[ExposeAnfrageService] submitExposeAnfrage');
    try {
      const exposeRef   = doc(this.firestore, 'expose-anfragen', sharedId);
      const customerRef = doc(this.firestore, 'customers', sharedId);
  
      // (1) Anfrage speichern – inkl. buyerData
      await setDoc(exposeRef, {
        ...anfrage,
        requestCustomerId: sharedId,
        creationDate: new Date().toISOString(),
      });
      console.log('✅ expose-anfragen gespeichert');
  
      // (2) Customer + Process + Preview
      const cleanPropertyId  = String(anfrage.requestPropertyId).trim();
      const inquiryProcessId = `${sharedId}_${cleanPropertyId}`;
  
      const customer = createCustomerFromExposeAnfrage(anfrage, sharedId);
  
      // ⬇️ buyerData an den Customer mergen (falls vorhanden)
      if (anfrage.buyerData) {
        // Sicherstellen, dass die angefragte ID drin ist
        const ids = new Set(anfrage.buyerData.angefragteImmobilienIds || []);
        ids.add(cleanPropertyId);
  
        customer.buyerData = {
          ...anfrage.buyerData,
          angefragteImmobilienIds: Array.from(ids),
        };
      }
  
      const process    = createInitialInquiryProcess(anfrage, inquiryProcessId);
      const processRef = doc(this.firestore, 'property-inquiry-processes', inquiryProcessId);
      const exposePreviewRef = doc(this.firestore, 'expose-previews', inquiryProcessId);
  
      await Promise.all([
        setDoc(processRef, process),
        setDoc(customerRef, customer, { merge: true }), // ⬅️ buyerData landet im Customer
        setDoc(exposePreviewRef, {
          exposeAccessLevel: 'normal',
          customerId: sharedId,
          propertyExternalId: cleanPropertyId,
          salutation: anfrage.salutation,
          firstName: anfrage.firstName,
          lastName: anfrage.lastName,
          blocked: false,
        }, { merge: true }),
      ]);
      console.log('✅ process, customer und expose-preview gespeichert');
  
      // (3) Immobilie laden (für Mail)
      const immobilie = await this.immobilienService.getProperty(cleanPropertyId);
  
      // (4) Interne Mail senden (du bekommst nun automatisch mehr Infos, weil buyerData im Anfrage-Dokument liegt)
      await this.http.post(
        'https://hilgert-immobilien.de/sendExposeAnfrageMail.php',
        {
          ...anfrage,
          autoExposeSend: immobilie?.autoExposeSend || false,
          propertyTitle: immobilie?.title || '',
        }
      ).toPromise();
  
      // (5) Auto-Expose, etc. (dein bestehender Code) …
      // ...
  
      // (6) Aufräumen (20s), fertig.
      setTimeout(async () => {
        try {
          await deleteDoc(exposeRef);
        } catch {}
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

   /** Manuelles Versenden des Exposé-Links an den Kunden für diesen Prozess */
   async sendExposeManual(
    process: PropertyInquiryProcess,
    customer: Customer,
    immobilie: Immobilie
  ): Promise<void> {
    if (!process?.inquiryProcessId) throw new Error('processId fehlt');
    if (!customer?.email) throw new Error('E-Mail des Kunden fehlt');
    if (!immobilie?.externalId) throw new Error('externalId der Immobilie fehlt');

    // Minimaler „Anfrage“-Stub für die bestehende Payload-Factory
    const anfrageStub = {
      salutation: customer.salutation,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.mobile || customer.phone || '',
      message: process.requestMessage || '',
      requestCustomerId: process.customerId,
      requestPropertyId: process.propertyExternalId,
    } as ExposeAnfrageDto;

    const payload = createExposeAnswerMailPayload(anfrageStub, immobilie);

    // Mail rausschicken
    await this.http
      .post('https://hilgert-immobilien.de/sendExposeAntwortMail.php', payload)
      .toPromise();

    // Prozess updaten (wie beim Auto-Versand)
    const now = Timestamp.now();
    const processRef = doc(this.firestore, 'property-inquiry-processes', process.inquiryProcessId);
    await setDoc(
      processRef,
      {
        exposeSent: now,
        inquiryProcessStatus: 'Exposé',
        lastUpdateDate: now,
      },
      { merge: true }
    );
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
