import { Injectable } from '@angular/core';
import { Feedback } from '../models/feedback.model';
import { FirebaseService } from './firebase.service';
import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  constructor(private firebase: FirebaseService, private http: HttpClient) {}

  async saveBewertung(feedback: Feedback): Promise<any> {
    try {
      const bewertungId = Date.now().toString();
      feedback.bewertungId = bewertungId;
      feedback.creationDate = new Date();
  
      const ref = doc(this.firebase.db, 'feedbacks', bewertungId);
      await setDoc(ref, feedback);
  
      // 🔔 NEU: Mail per PHP versenden
      const phpEndpoint = 'https://hilgert-immobilien.de/sendFeedbackMail.php';
      await this.http.post(phpEndpoint, feedback).toPromise();
  
      return { success: true, id: bewertungId };
    } catch (error) {
      console.error('Fehler beim Speichern oder Versenden der Bewertung:', error);
      return { success: false, error };
    }
  }

  async getFeedback(): Promise<Feedback[]> {
    const feedbackCollection = collection(this.firebase.db, 'feedbacks');
    const q = query(feedbackCollection, where('publicAccepted', '==', true));
  
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Feedback);
  }
  
}