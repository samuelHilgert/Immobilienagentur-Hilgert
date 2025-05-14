import { Injectable } from '@angular/core';
import { Feedback } from '../models/feedback.model';
import { FirebaseService } from './firebase.service';
import { collection, doc, getDocs, setDoc, query, where, orderBy } from 'firebase/firestore';
import { HttpClient } from '@angular/common/http';
import { CreationSource, Customer, CustomerRole } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  constructor(private firebase: FirebaseService, private http: HttpClient) {}

  async saveBewertung(feedback: Feedback): Promise<any> {
    try {
      // Gemeinsame ID für Feedback + Customer
      const sharedRef = doc(collection(this.firebase.db, 'feedbacks'));
      const sharedId = sharedRef.id;

      feedback.bewertungId = sharedId;
      feedback.feedbackCustomerId = sharedId;
      feedback.creationDate = new Date().toISOString();

      // 💬 Feedback speichern
      const feedbackRef = doc(this.firebase.db, 'feedbacks', sharedId);
      await setDoc(feedbackRef, feedback);

      // 👤 Customer aus Feedback ableiten
      const [firstName, lastName] = (feedback.autorName || 'Gast Nutzer').split(' ');

      const customer: Customer = {
        customerId: sharedId,
        salutation: '',
        firstName: firstName || '',
        lastName: lastName || '',
        street: '',
        houseNumber: '',
        zip: '',
        city: '',
        email: feedback.autorEmail || '',
        phone: '',
        mobile: '',
        roles: [CustomerRole.Feedbackformular],
        profession: '',
        birthday: '',
        source: CreationSource.Feedbackformular,
        creationDate: feedback.creationDate,
        lastModificationDate: new Date().toISOString(),
      };

      // 👤 Customer speichern
      const customerRef = doc(this.firebase.db, 'customers', sharedId);
      await setDoc(customerRef, customer);

      // 📩 Feedback-Mail senden
      const phpEndpoint = 'https://hilgert-immobilien.de/sendFeedbackMail.php';
      await this.http.post(phpEndpoint, feedback).toPromise();

      return { success: true, id: sharedId };
    } catch (error) {
      console.error('❌ Fehler beim Speichern oder Versenden der Bewertung:', error);
      return { success: false, error };
    }
  }

  async getFeedback(): Promise<Feedback[]> {
    try {
      const feedbackCollection = collection(this.firebase.db, 'feedbacks');
      
      // Abfrage nach `publicAccepted` und Sortierung nach `creationDate` in absteigender Reihenfolge
      const q = query(
        feedbackCollection,
        where('publicAccepted', '==', true),
        orderBy('creationDate', 'desc') // Sortierung nach creationDate, absteigend
      );
  
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Feedback);
    } catch (error) {
      console.error('Fehler beim Abrufen der Feedbacks:', error);
      throw new Error('Fehler beim Abrufen der Feedbacks');
    }
  }
  
  
}
