import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { KontaktAnfrage } from '../models/kontakt-anfrage.model';
import { HttpClient } from '@angular/common/http';
import { CustomerService } from './customer.service';
import { CreationSource, Customer, CustomerRole } from '../models/customer.model';
import { deleteDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class KontaktAnfrageService {
  constructor(
    private http: HttpClient,
    private customerService: CustomerService,
    private firestore: Firestore
  ) {}

  async submitKontaktAnfrage(
    anfrage: KontaktAnfrage
  ): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      // ✨ Eine eindeutige ID für beide Dokumente generieren
      const sharedRef = doc(collection(this.firestore, 'customers'));
      const sharedId = sharedRef.id;

      // 📩 Kontaktanfrage speichern unter dieser ID
      const kontaktRef = doc(
        collection(this.firestore, 'kontakt-anfragen'),
        sharedId
      );
      await setDoc(kontaktRef, {
        ...anfrage,
        customerId: sharedId,
        indexId: 0, // Falls du die noch brauchst
        creationDate: new Date().toISOString(),
      });

      // 👤 Kunde ebenfalls unter dieser ID speichern
      const customer: Customer = {
        customerId: sharedId,
        salutation: anfrage.salutation,
        firstName: anfrage.firstName,
        lastName: anfrage.lastName,
        street: '',
        houseNumber: '',
        zip: '',
        city: '',
        email: anfrage.email,
        phone: anfrage.phone || '',
        mobile: '',
        roles: [CustomerRole.Sonstige],
        profession: '',
        birthday: '',
        source: CreationSource.Kontaktformular,
        creationDate: new Date().toISOString(),
        lastModificationDate: new Date().toISOString(),
      };

      await setDoc(sharedRef, customer);

      // 📬 Interne Benachrichtigungs-Mail
      const phpEndpoint =
        'https://hilgert-immobilien.de/sendKontaktAnfrageMail.php';
      await this.http.post(phpEndpoint, anfrage).toPromise();

      // 🧹 Anfrage nach erfolgreicher Verarbeitung löschen
      setTimeout(async () => {
        try {
          await deleteDoc(kontaktRef);
        } catch (e) {
          console.warn('Kontaktanfrage konnte nicht gelöscht werden:', e);
        }
      }, 20000); // 20 Sek. Verzögerung als Sicherheit

      return { success: true, id: sharedId };
    } catch (error) {
      console.error('Fehler beim Speichern oder Versenden:', error);
      return { success: false, error };
    }
  }
}
