// src/app/services/firebase.service.ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, getDocs, 
  query, where, updateDoc, deleteDoc, orderBy 
} from 'firebase/firestore';
import { 
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject 
} from 'firebase/storage';
import { environment } from '../../environments/environments';
import { Feedback } from '../models/feedback.model';
import { listAll } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  app = initializeApp(environment.firebase);
  db = getFirestore(this.app);
  storage = getStorage(this.app);

  constructor() { }

  // Immobilie speichern
  async saveProperty(property: any): Promise<any> {
    try {
      // Timestamps setzen
      property.lastModificationDate = new Date().toISOString();
      if (!property.creationDate) {
        property.creationDate = new Date().toISOString();
      }
      
      // Dokument speichern
      const propertyRef = doc(this.db, 'properties', property.externalId);
      await setDoc(propertyRef, property);
      
      return { success: true, id: property.externalId };
    } catch (error) {
      console.error('Fehler beim Speichern der Immobilie:', error);
      return { success: false, error };
    }
  }

  // Immobilie abrufen
  async getProperty(externalId: string): Promise<any> {
    try {
      const propertyRef = doc(this.db, 'properties', externalId);
      const docSnap = await getDoc(propertyRef);
      
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id };
      } else {
        throw new Error('Immobilie nicht gefunden');
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Immobilie:', error);
      throw error;
    }
  }

  // Alle Immobilien abrufen
  async getProperties(filters?: any): Promise<any[]> {
    try {
      const propertiesRef = collection(this.db, 'properties');
      
      // Basis-Query
      let q = query(propertiesRef);
      
      // Filter anwenden, wenn vorhanden
      if (filters) {
        if (filters.propertyType) {
          q = query(q, where('propertyType', '==', filters.propertyType));
        }
        
        if (filters.propertyStatus) {
          q = query(q, where('propertyStatus', '==', filters.propertyStatus));
        }
        
        // Weitere Filter können bei Bedarf hinzugefügt werden
      }
      
      const querySnapshot = await getDocs(q);
      const properties: any[] = [];
      
      querySnapshot.forEach((doc) => {
        properties.push({ ...doc.data(), id: doc.id });
      });
      
      return properties;
    } catch (error) {
      console.error('Fehler beim Abrufen aller Immobilien:', error);
      return [];
    }
  }

  // Medium hochladen
  async uploadMedia(file: File, externalId: string, type: 'image' | 'video'): Promise<any> {
    try {
      // Eindeutigen Dateinamen generieren
      const timestamp = new Date().getTime();
      const filename = `${externalId}_${timestamp}_${file.name}`;
      
      // In Firebase Storage hochladen
      const storageRef = ref(this.storage, `property-media/${externalId}/${filename}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Media-Informationen in Firestore speichern
      const mediaId = `${externalId}_${timestamp}`;
      const mediaData = {
        id: mediaId,
        externalId,
        type,
        url: downloadURL,
        filename,
        uploadDate: new Date().toISOString(),
        isTitleImage: false
      };
      
      await setDoc(doc(this.db, 'media', mediaId), mediaData);
      
      return { 
        success: true, 
        id: mediaId,
        url: downloadURL 
      };
    } catch (error) {
      console.error('Fehler beim Hochladen:', error);
      throw error;
    }
  }

  // Medium löschen
  async deleteMedia(mediaId: string): Promise<any> {
    try {
      const mediaDoc = doc(this.db, 'media', mediaId);
      const mediaSnap = await getDoc(mediaDoc);
      
      if (mediaSnap.exists()) {
        const mediaData = mediaSnap.data() as any;
        
        // Datei aus dem Storage löschen, falls vorhanden
        if (mediaData.url) {
          try {
            // Extrahiere den Pfad aus der URL
            const storagePath = decodeURIComponent(mediaData.url.split('/o/')[1].split('?')[0]);
            const storageRef = ref(this.storage, storagePath);
            await deleteObject(storageRef);
          } catch (e) {
            console.warn('Fehler beim Löschen der Datei aus Storage:', e);
          }
        }
        
        // Dokument aus Firestore löschen
        await deleteDoc(mediaDoc);
        
        return { success: true };
      } else {
        return { success: false, error: 'Medium nicht gefunden' };
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Mediums:', error);
      throw error;
    }
  }

  // Titelbild festlegen
  async setTitleImage(mediaId: string, externalId: string): Promise<any> {
    try {
      // Zuerst bestehende Titelbilder zurücksetzen
      const mediaCollection = collection(this.db, 'media');
      const q = query(
        mediaCollection, 
        where('externalId', '==', externalId),
        where('isTitleImage', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Alle bestehenden Titelbilder zurücksetzen
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isTitleImage: false })
      );
      
      await Promise.all(updatePromises);
      
      // Neues Titelbild setzen
      const mediaRef = doc(this.db, 'media', mediaId);
      await updateDoc(mediaRef, { isTitleImage: true });
      
      return { success: true };
    } catch (error) {
      console.error('Fehler beim Festlegen des Titelbilds:', error);
      throw error;
    }
  }

  // Alle Medien für eine Immobilie abrufen
  async getMediaForProperty(externalId: string): Promise<any[]> {
    try {
      const mediaCollection = collection(this.db, 'media');
      const q = query(
        mediaCollection,
        where('externalId', '==', externalId),
        orderBy('uploadDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const media: any[] = [];
      
      querySnapshot.forEach((doc) => {
        media.push({ ...doc.data(), id: doc.id });
      });
      
      return media;
    } catch (error) {
      console.error('Fehler beim Abrufen der Medien:', error);
      return [];
    }
  }

  async getAllFeedbacks(): Promise<Feedback[]> {
    try {
      const feedbackCollection = collection(this.db, 'feedbacks');
      const snapshot = await getDocs(feedbackCollection);
  
      const feedbacks: Feedback[] = [];
      snapshot.forEach(doc => {
        feedbacks.push({ ...(doc.data() as Feedback), bewertungId: doc.id });
      });
  
      return feedbacks;
    } catch (error) {
      console.error('Fehler beim Abrufen der Feedbacks:', error);
      throw error;
    }
  }

  // Immobilie löschen
async deleteProperty(externalId: string): Promise<void> {
  const refDoc = doc(this.db, 'properties', externalId);
  await deleteDoc(refDoc);
}

// Firebase Storage-Ordner löschen (rekursiv)
async deleteStorageFolder(path: string): Promise<void> {
  try {
    const listRef = ref(this.storage, path);
    const res = await listAll(listRef);
    
    const deletePromises = res.items.map(itemRef => deleteObject(itemRef));
    await Promise.all(deletePromises);
  } catch (error) {
    console.warn('Fehler beim Löschen des Storage-Ordners:', error);
    // Kein throw, da es z. B. bei leeren Ordnern auch fehlschlagen kann
  }
}

}