import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { environment } from '../../environments/environments';
import { ExposeAnfrage } from '../models/expose-anfrage.model';
import { HttpClient } from '@angular/common/http';
import { CustomerService } from './customer.service';
import { Customer, CustomerRole } from '../models/customer.model';
import { ImmobilienService } from './immobilien.service';

@Injectable({
  providedIn: 'root',
})
export class ExposeAnfrageService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);

  constructor(
    private http: HttpClient,
    private customerService: CustomerService,
    private immobilienService: ImmobilienService
  ) {}

  async submitExposeAnfrage(
    anfrage: ExposeAnfrage
  ): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const exposeRef = collection(this.db, 'expose-anfragen');
      const newDocRef = doc(exposeRef);
      const customerId = await this.generateUniqueCustomerId();
      const indexId = await this.getNextExposeIndexId();

      const payload: ExposeAnfrage = {
        ...anfrage,
        customerId,
        indexId,
        creationDate: new Date().toISOString(),
      };
  
      // 🔹 1. Anfrage in Firestore speichern
      await setDoc(newDocRef, payload);
  
      // 🔹 2. Kunde aus Anfrage-Daten erstellen
      await this.createCustomerFromExpose(payload);
  
      // 🔹 3. Interne Benachrichtigungs-E-Mail an dich (bestehende PHP-Datei)
      const internalMailEndpoint = 'https://hilgert-immobilien.de/sendExposeAnfrageMail.php';
      await this.http.post(internalMailEndpoint, payload).toPromise();
  
      // 🔹 4. Immobiliendaten ergänzen für Antwort-Mail
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
        ...payload,
        numberOfRooms: immobilie?.numberOfRooms || '',
        city: immobilie?.city || '',
        marketingType: mapMarketingType(immobilie?.marketingType || ''),
        immobilienTyp: immobilie?.propertyType || '',
        exposePdfUrl: immobilie?.exposePdfUrl || '',
      };
  
      // 🔹 5. Automatische Antwort an Kunden senden
      const autoReplyEndpoint = 'https://hilgert-immobilien.de/sendExposeAntwortMail.php';
      await this.http.post(autoReplyEndpoint, mailPayload).toPromise();
  
      return { success: true, id: customerId };
    } catch (error) {
      console.error('Fehler beim Speichern oder Versenden:', error);
      return { success: false, error };
    }
  }  

  private async createCustomerFromExpose(anfrage: ExposeAnfrage) {
    const customersCount = await this.customerService.getNextCustomerIndexId();
    const newCustomerId = anfrage.customerId;

    const newCustomer: Customer = {
      customerId: newCustomerId,
      indexId: customersCount + 1,
      salutation: anfrage.salutation,
      firstName: anfrage.firstName,
      lastName: anfrage.lastName,
      street: anfrage['street'] || '',
      houseNumber: String(anfrage.houseNumber || ''),
      postalCode: anfrage['zip'] || '',
      city: anfrage['city'] || '',
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

    await this.customerService.saveCustomer(newCustomer);
  }

  // 🔢 Zufällige 5-stellige ID erzeugen
  private generateRandomId(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  // 🔐 Eindeutige ID erzeugen
  async generateUniqueCustomerId(): Promise<string> {
    let uniqueId = '';
    let exists = true;

    while (exists) {
      const potentialId = this.generateRandomId();

      // 🔍 Check in expose-anfragen
      const exposeRef = collection(this.db, 'expose-anfragen');
      const exposeSnapshot = await getDocs(exposeRef);
      const exposeExists = exposeSnapshot.docs.some(
        (doc) => doc.data()['customerId'] === potentialId
      );

      // 🔍 Check in customers
      const customersRef = collection(this.db, 'customers');
      const customerSnapshot = await getDocs(customersRef);
      const customerExists = customerSnapshot.docs.some(
        (doc) => doc.id === potentialId
      );

      exists = exposeExists || customerExists;

      if (!exists) {
        uniqueId = potentialId;
      }
    }

    return uniqueId;
  }

  // 🧮 Nächste freie indexId ermitteln (immer +10)
  async getNextExposeIndexId(): Promise<number> {
    try {
      const exposeRef = collection(this.db, 'expose-anfragen');
      const snapshot = await getDocs(exposeRef);

      const maxIndex = snapshot.docs
        .map((doc) => Number(doc.data()['indexId']))
        .filter((id) => !isNaN(id) && id >= 0)
        .reduce((max, id) => (id > max ? id : max), 0);

      return maxIndex + 2;
    } catch (error) {
      console.error('Fehler beim Berechnen der nächsten Index-ID:', error);
      return 2;
    }
  }

  // Um alle Epxose Anfragen zu einer bestimmten Immobilie im Dashboard anzuzeigen
  async getAnfragenByImmobilienId(
    immobilienId: string
  ): Promise<ExposeAnfrage[]> {
    const exposeRef = collection(this.db, 'expose-anfragen');
    const q = query(exposeRef, where('immobilienId', '==', immobilienId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as ExposeAnfrage);
  }
}
