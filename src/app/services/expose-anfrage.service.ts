import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
} from 'firebase/firestore';
import { environment } from '../../environments/environments';
import { ExposeAnfrage } from '../models/expose-anfrage.model';
import { HttpClient } from '@angular/common/http';
import { CustomerService } from './customer.service';
import { Customer, CustomerRole } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class ExposeAnfrageService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);

  constructor(
    private http: HttpClient,
    private customerService: CustomerService
  ) {}

  async submitExposeAnfrage(
    anfrage: ExposeAnfrage
  ): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const exposeRef = collection(this.db, 'expose-anfragen');
      const newDocRef = doc(exposeRef);
      const customerId = newDocRef.id;

      const count = await this.getExposeAnfragenCount();

      const payload: ExposeAnfrage = {
        ...anfrage,
        customerId,
        indexId: count + 1,
        creationDate: new Date().toISOString(),
      };

      await setDoc(newDocRef, payload);

      // 🆕 Neuen Kunden erzeugen:
      await this.createCustomerFromExpose(payload);

      // E-Mail Notification
      const phpEndpoint =
        'https://hilgert-immobilien.de/sendExposeAnfrageMail.php';
      await this.http.post(phpEndpoint, payload).toPromise();

      return { success: true, id: customerId };
    } catch (error) {
      console.error('Fehler beim Speichern oder Versenden:', error);
      return { success: false, error };
    }
  }

  private async createCustomerFromExpose(anfrage: ExposeAnfrage) {
    const customersCount = await this.customerService.getCustomersCount();
    const newCustomerId = anfrage.customerId;

    const newCustomer: Customer = {
      customerId: newCustomerId,
      indexId: customersCount + 1,
      salutation: anfrage.salutation,
      firstName: anfrage.firstName,
      lastName: anfrage.lastName,
      street: anfrage['street'] || '',
      houseNumber: Number(anfrage['houseNumber'] || 0),
      postalCode: anfrage['zip'] || '',
      city: anfrage['city'] || '',
      email: anfrage.email,
      phone: anfrage.phone,
      mobile: '',
      roles: [CustomerRole.PROSPECT],
      profession: '',
      birthday: '',
      creationDate: new Date().toISOString(),
      lastModificationDate: new Date().toISOString(),
    };

    await this.customerService.saveCustomer(newCustomer);
  }

  async getExposeAnfragenCount(): Promise<number> {
    try {
      const exposeRef = collection(this.db, 'expose-anfragen');
      const snapshot = await getDocs(exposeRef);
      return snapshot.size; // Anzahl der Dokumente
    } catch (error) {
      console.error('Fehler beim Zählen der Anfragen:', error);
      return 0;
    }
  }
}
