// src/app/services/property-docs.service.ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environments';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  getBlob,
} from 'firebase/storage';

export interface PropertyDoc {
  id: string; // Firestore-Dokument-ID
  externalId: string; // Bezug zur Immobilie
  fileName: string; // tatsächlicher Dateiname im Storage
  displayName: string; // frei änderbarer Anzeigename
  storagePath: string; // z.B. property-docs/12345/1699999999_kaufvertrag.pdf
  url: string; // Download-URL
  contentType?: string;
  size?: number;
  uploadDate: string; // ISO
}

@Injectable({ providedIn: 'root' })
export class PropertyDocsService {
  private app = initializeApp(environment.firebase);
  private db = getFirestore(this.app);
  private storage = getStorage(this.app);

  /** Alle Dokumente zu einer Immobilie auflisten (neueste zuerst). */
  async listForProperty(externalId: string): Promise<PropertyDoc[]> {
    const col = collection(this.db, 'property-docs');
    const qy = query(
      col,
      where('externalId', '==', externalId),
      orderBy('uploadDate', 'desc')
    );
    const snap = await getDocs(qy);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PropertyDoc, 'id'>),
    }));
  }

  /** Optional: robust direkt aus dem Storage lesen (falls Metadaten fehlen). */
  async listFromStorageOnly(externalId: string): Promise<PropertyDoc[]> {
    const folderRef = ref(this.storage, `property-docs/${externalId}`);
    const res = await listAll(folderRef);
    const items = await Promise.all(
      res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const fileName = itemRef.name;
        const path = itemRef.fullPath;
        // Minimal-Objekt; ohne Firestore-Metadaten
        return <PropertyDoc>{
          id: path, // Platzhalter
          externalId,
          fileName,
          displayName: fileName,
          storagePath: path,
          url,
          uploadDate: new Date().toISOString(),
        };
      })
    );
    // Neueste (heuristisch: Name enthält timestamp Prefix) nach Namen sortieren:
    return items.sort((a, b) => b.fileName.localeCompare(a.fileName));
  }

  /** Hochladen eines neuen Dokuments. */
  async uploadDoc(
    file: File,
    externalId: string,
    displayName?: string
  ): Promise<{ success: boolean; doc?: PropertyDoc; error?: any }> {
    try {
      const ts = Date.now();
      const safeName = this.makeSafeName(file.name);
      const fileName = `${externalId}_${ts}_${safeName}`;
      const storagePath = `property-docs/${externalId}/${fileName}`;
      const storageRef = ref(this.storage, storagePath);

      // ✅ NEU: erzwinge Download + Dateiname
      const downloadName = this.makeSafeName(displayName || file.name);
      const metadata = {
        contentType: file.type || 'application/octet-stream',
        contentDisposition: `attachment; filename="${downloadName}"`,
      };

      // ⬇️ metadata als 3. Parameter übergeben
      const snap = await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(snap.ref);

      const docId = `${externalId}_${ts}`;
      const meta: PropertyDoc = {
        id: docId,
        externalId,
        fileName,
        displayName: displayName || file.name,
        storagePath,
        url,
        contentType: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
      };

      await setDoc(doc(this.db, 'property-docs', docId), meta);
      return { success: true, doc: meta };
    } catch (error) {
      console.error('Upload fehlgeschlagen:', error);
      return { success: false, error };
    }
  }

  /** Umbenennen (Displayname ODER tatsächlicher Dateiname).
   *  - displayOnly=true: nur Anzeigename in Firestore ändern
   *  - displayOnly=false: echte Umbenennung im Storage (Copy + Delete + URL aktualisieren)
   */
  async renameDoc(
    docId: string,
    newName: string,
    displayOnly = true
  ): Promise<void> {
    const refFS = doc(this.db, 'property-docs', docId);
    const snap = await getDoc(refFS);
    if (!snap.exists()) throw new Error('Dokument nicht gefunden');
    const meta = snap.data() as PropertyDoc;

    if (displayOnly) {
      await updateDoc(refFS, { displayName: newName });
      return;
    }

    // ECHTE Umbenennung im Storage:
    // 1) ursprüngliche Datei laden
    const oldRef = ref(this.storage, meta.storagePath);
    const blob = await getBlob(oldRef);

    // 2) neuen Pfad/Name bestimmen
    const folder = `property-docs/${meta.externalId}`;
    const safeNew = this.makeSafeName(newName);
    const newFileName = safeNew.includes('.')
      ? safeNew
      : this.applyOriginalExt(safeNew, meta.fileName);
    const newPath = `${folder}/${newFileName}`;
    const newRef = ref(this.storage, newPath);

    // 3) hochladen
    await uploadBytes(newRef, blob);
    const newUrl = await getDownloadURL(newRef);

    // 4) alte Datei löschen
    await deleteObject(oldRef);

    // 5) Firestore-Metadaten aktualisieren
    await updateDoc(refFS, {
      fileName: newFileName,
      storagePath: newPath,
      url: newUrl,
      displayName: newName,
    });
  }

  /** Löschen (Storage + Firestore). */
  async deleteDoc(docId: string): Promise<void> {
    const refFS = doc(this.db, 'property-docs', docId);
    const snap = await getDoc(refFS);
    if (!snap.exists()) {
      // Firestore schon weg? dann sind wir fertig.
      return;
    }
    const meta = snap.data() as PropertyDoc;
    try {
      await deleteObject(ref(this.storage, meta.storagePath));
    } finally {
      await deleteDoc(refFS);
    }
  }

  /** Download-URL frisch holen (falls abgelaufen). */
  async refreshUrl(docId: string): Promise<string> {
    const refFS = doc(this.db, 'property-docs', docId);
    const snap = await getDoc(refFS);
    if (!snap.exists()) throw new Error('Dokument nicht gefunden');

    const meta = snap.data() as PropertyDoc;
    const newUrl = await getDownloadURL(ref(this.storage, meta.storagePath));

    await updateDoc(refFS, {
      url: newUrl,
      uploadDate: meta.uploadDate || new Date().toISOString(),
    });
    return newUrl;
  }

  // ---------------- helpers ----------------

  private makeSafeName(name: string): string {
    // einfache Safe-Filename-Strategie
    return name
      .trim()
      .replace(/[\/\\:#?"<>|]+/g, '_')
      .replace(/\s+/g, '_');
  }

  private applyOriginalExt(base: string, originalFileName: string): string {
    const idx = originalFileName.lastIndexOf('.');
    const ext = idx >= 0 ? originalFileName.slice(idx) : '';
    return `${base}${ext}`;
  }

  
}
