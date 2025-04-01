import { Injectable } from '@angular/core';
import { Feedback } from '../models/feedback.model';
import { FirebaseService } from './firebase.service';
import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  constructor(private firebase: FirebaseService) {}

  async saveBewertung(feedback: Feedback): Promise<any> {
    try {
      const bewertungId = Date.now().toString();
      feedback.bewertungId = bewertungId;
      feedback.creationDate = new Date();

      const ref = doc(this.firebase.db, 'feedbacks', bewertungId);
      await setDoc(ref, feedback);

      return { success: true, id: bewertungId };
    } catch (error) {
      console.error('Fehler beim Speichern der Bewertung:', error);
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
