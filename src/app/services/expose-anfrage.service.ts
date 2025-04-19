import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { ExposeAnfrage } from '../models/expose-anfrage.model';
import { HttpClient } from '@angular/common/http';
import { CustomerService } from './customer.service';
import { Customer, CustomerRole } from '../models/customer.model';
import { ImmobilienService } from './immobilien.service';
import { getDocs, query, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ExposeAnfrageService {
  constructor(
    private http: HttpClient,
    private customerService: CustomerService,
    private immobilienService: ImmobilienService,
    private firestore: Firestore
  ) {}

  async submitExposeAnfrage(
    anfrage: ExposeAnfrage
  ): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      // ✨ Gemeinsame eindeutige ID generieren
      const sharedRef = doc(collection(this.firestore, 'customers'));
      const sharedId = sharedRef.id;
  
      // 📩 Exposé-Anfrage speichern unter dieser ID
      const exposeRef = doc(collection(this.firestore, 'expose-anfragen'), sharedId);
      await setDoc(exposeRef, {
        ...anfrage,
        customerId: sharedId,
        creationDate: new Date().toISOString(),
      });
  
      // 👤 Kunden unter derselben ID speichern
      const customer: Customer = {
        customerId: sharedId,
        salutation: anfrage.salutation,
        firstName: anfrage.firstName,
        lastName: anfrage.lastName,
        street: anfrage.street || '',
        houseNumber: String(anfrage.houseNumber || ''),
        postalCode: anfrage.zip || '',
        city: anfrage.city || '',
        email: anfrage.email,
        phone: anfrage.phone,
        mobile: '',
        roles: [CustomerRole.Interessent],
        profession: '',
        birthday: '',
        creationDate: new Date().toISOString(),
        lastModificationDate: new Date().toISOString(),
        angefragteImmobilienIds: [anfrage.immobilienId],
      };
  
      await setDoc(sharedRef, customer);
  
      // 📬 Interne E-Mail an dich
      const internalMailEndpoint = 'https://hilgert-immobilien.de/sendExposeAnfrageMail.php';
      await this.http.post(internalMailEndpoint, anfrage).toPromise();
  
      // 📬 Automatische Antwortmail an Interessent
      const immobilie = await this.immobilienService.getProperty(anfrage.immobilienId);
  
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
        externalId: anfrage.immobilienId,
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
          const autoReplyEndpoint = 'https://hilgert-immobilien.de/sendExposeAntwortMail.php';
          await this.http.post(autoReplyEndpoint, mailPayload).toPromise();
        } catch (e) {
          console.error('Fehler beim Senden der Antwortmail', e);
        }
      }, 10000);
  
      return { success: true, id: sharedId };
  
    } catch (error) {
      console.error('Fehler beim Speichern oder Versenden:', error);
      return { success: false, error };
    }
  }
  
  // 🔐 Nur Admins können alle Anfragen zu einer Immobilie einsehen
  async getAnfragenByImmobilienId(
    immobilienId: string
  ): Promise<ExposeAnfrage[]> {
    const exposeRef = collection(this.firestore, 'expose-anfragen');
    const q = query(exposeRef, where('immobilienId', '==', immobilienId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as ExposeAnfrage);
  }
}
