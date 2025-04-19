import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { environment } from '../../environments/environments';
import { KontaktAnfrage } from '../models/kontakt-anfrage.model';
import { HttpClient } from '@angular/common/http';
import { Customer, CustomerRole } from '../models/customer.model';
import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'root'
})
export class KontaktAnfrageService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);

  constructor(
    private http: HttpClient,
    private customerService: CustomerService
  ) {}

  async submitKontaktAnfrage(anfrage: KontaktAnfrage): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const ref = collection(this.db, 'kontakt-anfragen');

      const customerId = await this.generateUniqueCustomerId();
      const indexId = await this.getNextKontaktIndexId();

      const payload: KontaktAnfrage = {
        ...anfrage,
        customerId,
        indexId,
        creationDate: new Date().toISOString(),
      };

      const newDocRef = doc(ref, customerId); // direkt mit ID setzen
      await setDoc(newDocRef, payload);

      // 🔁 Auch Customer anlegen
      await this.createCustomerFromKontakt(payload);

      // E-Mail Notification
      const phpEndpoint = 'https://hilgert-immobilien.de/sendKontaktAnfrageMail.php';
      await this.http.post(phpEndpoint, payload).toPromise();

      return { success: true, id: customerId };
    } catch (error) {
      console.error('Fehler beim Speichern oder Versenden:', error);
      return { success: false, error };
    }
  }

  private async createCustomerFromKontakt(anfrage: KontaktAnfrage) {
    const indexId = await this.customerService.getNextCustomerIndexId();
    const newCustomer: Customer = {
      customerId: anfrage.customerId,
      indexId,
      salutation: anfrage.salutation,
      firstName: anfrage.firstName,
      lastName: anfrage.lastName,
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      email: anfrage.email,
      phone: anfrage.phone || '',
      mobile: anfrage.mobile || '',
      roles: [CustomerRole.Sonstige],
      profession: '',
      birthday: '',
      creationDate: new Date().toISOString(),
      lastModificationDate: new Date().toISOString(),
    };

    await this.customerService.saveCustomer(newCustomer);
  }

  private generateRandomId(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  async generateUniqueCustomerId(): Promise<string> {
    let uniqueId = '';
    let exists = true;

    while (exists) {
      const potentialId = this.generateRandomId();

      const kontaktRef = collection(this.db, 'kontakt-anfragen');
      const kontaktSnapshot = await getDocs(kontaktRef);
      const kontaktExists = kontaktSnapshot.docs.some(doc => doc.data()['customerId'] === potentialId);

      const customerRef = collection(this.db, 'customers');
      const customerSnapshot = await getDocs(customerRef);
      const customerExists = customerSnapshot.docs.some(doc => doc.id === potentialId);

      exists = kontaktExists || customerExists;
      if (!exists) uniqueId = potentialId;
    }

    return uniqueId;
  }

  async getNextKontaktIndexId(): Promise<number> {
    try {
      const ref = collection(this.db, 'kontakt-anfragen');
      const snapshot = await getDocs(ref);

      const maxIndex = snapshot.docs
        .map((doc) => Number(doc.data()['indexId']))
        .filter((id) => !isNaN(id) && id >= 0)
        .reduce((max, id) => (id > max ? id : max), 0);

      return maxIndex + 2;
    } catch (error) {
      console.error('Fehler beim Ermitteln der Kontakt-IndexId:', error);
      return 2;
    }
  }
}