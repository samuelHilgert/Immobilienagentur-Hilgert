// src/app/services/media.service.ts
import { Injectable } from '@angular/core';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environments';
import { MediaAttachment } from '../models/media.model';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private app = initializeApp(environment.firebase);
  private db = getFirestore(this.app);
  private storage = getStorage(this.app);

  async getMediaForProperty(externalId: string): Promise<MediaAttachment[]> {
    const mediaCollection = collection(this.db, 'media');
    const q = query(mediaCollection, where('externalId', '==', externalId), orderBy('uploadDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...(doc.data() as MediaAttachment), id: doc.id }));
  }

  async deleteMedia(mediaId: string): Promise<void> {
    const mediaRef = doc(this.db, 'media', mediaId);
    const mediaSnap = await getDoc(mediaRef);

    if (mediaSnap.exists()) {
      const mediaData = mediaSnap.data() as MediaAttachment;
      const path = decodeURIComponent(mediaData.url.split('/o/')[1].split('?')[0]);
      await deleteObject(ref(this.storage, path));
      await deleteDoc(mediaRef);
    }
  }

  async setTitleImage(mediaId: string, externalId: string): Promise<void> {
    const mediaCollection = collection(this.db, 'media');
    const q = query(mediaCollection, where('externalId', '==', externalId), where('isTitleImage', '==', true));
    const snapshot = await getDocs(q);
    const resetTitlePromises = snapshot.docs.map(doc => updateDoc(doc.ref, { isTitleImage: false }));
    await Promise.all(resetTitlePromises);
    await updateDoc(doc(this.db, 'media', mediaId), { isTitleImage: true });
  }

  async updateDescription(mediaId: string, description: string): Promise<void> {
    await updateDoc(doc(this.db, 'media', mediaId), { description });
  }

  async uploadMedia(
    file: File,
    externalId: string,
    type: 'image' | 'video'
  ): Promise<{ success: boolean; id?: string; url?: string; error?: any }> {
    try {
      const timestamp = new Date().getTime();
      const filename = `${externalId}_${timestamp}_${file.name}`;
      const storageRef = ref(this.storage, `property-media/${externalId}/${filename}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
  
      const mediaId = `${externalId}_${timestamp}`;
      const mediaData: MediaAttachment = {
        id: mediaId,
        externalId,
        type,
        url: downloadURL,
        uploadDate: new Date().toISOString(),
        isTitleImage: false,
        description: ''
      };
  
      await setDoc(doc(this.db, 'media', mediaId), mediaData);
  
      return { success: true, id: mediaId, url: downloadURL };
    } catch (error) {
      console.error('Fehler beim Hochladen des Mediums:', error);
      return { success: false, error };
    }
  }

    //Titelbild ermitteln
    getTitleImage(mediaList: MediaAttachment[]): MediaAttachment | undefined {
      return mediaList.find(m => m.isTitleImage) || mediaList[0];
    }

   //  Nur Bilder (ohne Videos) zurückgeben
    getImagesOnly(mediaList: MediaAttachment[]): MediaAttachment[] {
      return mediaList.filter(m => m.type === 'image');
    }
    
    // Galerie-Ansicht vorbereiten
    getGalleryImages(mediaList: MediaAttachment[]): MediaAttachment[] {
      const titleImage = this.getTitleImage(mediaList);
      return mediaList.filter(m => m !== titleImage);
    }

    // Nur Titelbild laden 
    async getTitleImageForProperty(externalId: string): Promise<MediaAttachment | null> {
      const mediaCollection = collection(this.db, 'media');
      
      // Suche nach Titelbild
      const titleQuery = query(
        mediaCollection,
        where('externalId', '==', externalId),
        where('isTitleImage', '==', true)
      );
    
      const titleSnap = await getDocs(titleQuery);
      if (!titleSnap.empty) {
        return { ...(titleSnap.docs[0].data() as MediaAttachment), id: titleSnap.docs[0].id };
      }
    
      // Fallback: erstes Medium
      const allMediaQuery = query(
        mediaCollection,
        where('externalId', '==', externalId),
        orderBy('uploadDate', 'desc')
      );
    
      const fallbackSnap = await getDocs(allMediaQuery);
      if (!fallbackSnap.empty) {
        return { ...(fallbackSnap.docs[0].data() as MediaAttachment), id: fallbackSnap.docs[0].id };
      }
    
      return null;
    }
    
    
}
