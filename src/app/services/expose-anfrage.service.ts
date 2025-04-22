import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { CustomerService } from './customer.service';
import {
  CreationSource,
  Customer,
  CustomerRole,
} from '../models/customer.model';
import { ImmobilienService } from './immobilien.service';
import { deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { prospectiveBuyer } from '../models/prospectiveBuyer.model';
import { ExposeAnfrageDto } from '../models/expose-anfrage.model';

@Injectable({
  providedIn: 'root',
})
export class ExposeAnfrageService {
  public firestore: Firestore;

  constructor(
    private http: HttpClient,
    private customerService: CustomerService,
    private immobilienService: ImmobilienService,
    firestore: Firestore // 👉 ohne private
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
  
      // 💡 Kunde inkl. BuyerData
      const customer: Customer & { buyerData: prospectiveBuyer } = {
        customerId: sharedId,
        salutation: anfrage.salutation,
        company: anfrage.company,
        firstName: anfrage.firstName,
        lastName: anfrage.lastName,
        street: anfrage.street,
        houseNumber: anfrage.houseNumber,
        zip: anfrage.zip,
        city: anfrage.city,
        email: anfrage.email,
        phone: anfrage.phone,
        mobile: '',
        profession: '',
        birthday: '',
        roles: [CustomerRole.Interessent],
        source: CreationSource.ExposeAnfrage,
        creationDate: new Date().toISOString(),
        lastModificationDate: new Date().toISOString(),
        buyerData: {
          angefragteImmobilienIds: [anfrage.requestPropertyId],
          requestMessage: anfrage.message,
          processStatus: 'Anfrage',
        },
      };
  
      await setDoc(customerRef, customer, { merge: true });
  
      // 📩 Interne Mail
      const internalMailEndpoint = 'https://hilgert-immobilien.de/sendExposeAnfrageMail.php';
      await this.http.post(internalMailEndpoint, anfrage).toPromise();
  
      // 📩 Automatische Antwort an Kunden
      const immobilie = await this.immobilienService.getProperty(anfrage.requestPropertyId);
      const mapMarketingType = (code: string) => {
        switch ((code || '').toUpperCase()) {
          case 'PURCHASE': return 'Kauf';
          case 'RENT': return 'Miete';
          case 'LEASEHOLD': return 'Erbpacht';
          default: return 'Kauf';
        }
      };
  
      const mailPayload = {
        email: anfrage.email,
        externalId: anfrage.requestPropertyId,
        lastName: anfrage.lastName,
        salutation: anfrage.salutation,
        numberOfRooms: immobilie?.numberOfRooms || '',
        city: immobilie?.city || '',
        value: immobilie?.value || 0,
        marketingType: mapMarketingType(immobilie?.marketingType || ''),
        immobilienTyp: immobilie?.propertyType || '',
        exposePdfUrl: immobilie?.exposePdfUrl || '',
      };
  
      setTimeout(async () => {
        try {
          await this.http
            .post('https://hilgert-immobilien.de/sendExposeAntwortMail.php', mailPayload)
            .toPromise();
        } catch (e) {
          console.error('Fehler beim Senden der Antwortmail', e);
        }
      }, 10000);
  
      // 🧹 Exposé-Anfrage nach 20s löschen
      setTimeout(async () => {
        try {
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
