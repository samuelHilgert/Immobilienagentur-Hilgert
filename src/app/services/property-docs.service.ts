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
  updateMetadata,
  getMetadata,
} from 'firebase/storage';

export interface PropertyDoc {
  id: string;
  externalId: string;
  fileName: string;
  displayName: string;
  storagePath: string;
  url: string;
  contentType?: string;
  size?: number;
  uploadDate: string;
}

@Injectable({ providedIn: 'root' })
export class PropertyDocsService {
  private app = initializeApp(environment.firebase);
  private db = getFirestore(this.app);
  private storage = getStorage(this.app);

  async listForProperty(externalId: string): Promise<PropertyDoc[]> {
    const col = collection(this.db, 'property-docs');
    const qy  = query(col, where('externalId','==',externalId), orderBy('uploadDate','desc'));
    const snap = await getDocs(qy);
  
    const docs = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<PropertyDoc,'id'>),
    }));
  
    // Alle URLs frisch holen
    await Promise.all(docs.map(async (doc) => {
      try {
        doc.url = await getDownloadURL(ref(this.storage, doc.storagePath));
      } catch (e) {
        console.warn('getDownloadURL failed for', doc.storagePath, e);
      }
    }));
  
    return docs;
  }

  async listFromStorageOnly(externalId: string): Promise<PropertyDoc[]> {
    const folderRef = ref(this.storage, `property-docs/${externalId}`);
    const res = await listAll(folderRef);
    const items = await Promise.all(
      res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const fileName = itemRef.name;
        const path = itemRef.fullPath;
        return <PropertyDoc>{
          id: path,
          externalId,
          fileName,
          displayName: fileName,
          storagePath: path,
          url,
          uploadDate: new Date().toISOString(),
        };
      })
    );
    return items.sort((a, b) => b.fileName.localeCompare(a.fileName));
  }

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

      // ↓ immer sinnvoller MIME-Type bestimmen
      const contentType = this.guessContentType(file.name, file.type);

      // ✅ WICHTIG: attachment statt inline
      const downloadName = this.makeSafeName(displayName || file.name);
      const metadata = {
        contentType,
        contentDisposition: `attachment; filename="${downloadName}"`,
      };

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
        contentType,
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

  /** Umbenennen */
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
      try {
        const objRef = ref(this.storage, meta.storagePath);
        await updateMetadata(objRef, {
          contentDisposition: `attachment; filename="${this.makeSafeName(newName)}"`, // ← attachment!
        });
      } catch {}
      return;
    }

    // Echte Umbenennung: Copy mit METADATEN erhalten!
    const oldRef = ref(this.storage, meta.storagePath);
    const [blob, oldMd] = await Promise.all([
      getBlob(oldRef),
      getMetadata(oldRef),
    ]);

    const folder = `property-docs/${meta.externalId}`;
    const safeNew = this.makeSafeName(newName);
    const newFileName = safeNew.includes('.')
      ? safeNew
      : this.applyOriginalExt(safeNew, meta.fileName);
    const newPath = `${folder}/${newFileName}`;
    const newRef = ref(this.storage, newPath);
    // echte Umbenennung: Metadaten beibehalten, aber auf attachment setzen
    const newMd = {
      contentType: oldMd.contentType || this.guessContentType(newFileName, ''),
      contentDisposition: `attachment; filename="${this.makeSafeName(newName)}"`, // ← attachment!
    };
    

    await uploadBytes(newRef, blob, newMd);
    const newUrl = await getDownloadURL(newRef);
    await deleteObject(oldRef);

    await updateDoc(refFS, {
      fileName: newFileName,
      storagePath: newPath,
      url: newUrl,
      displayName: newName,
      contentType: newMd.contentType,
    });
  }

  async deleteDoc(docId: string): Promise<void> {
    const refFS = doc(this.db, 'property-docs', docId);
    const snap = await getDoc(refFS);
    if (!snap.exists()) return;
    const meta = snap.data() as PropertyDoc;
    try {
      await deleteObject(ref(this.storage, meta.storagePath));
    } finally {
      await deleteDoc(refFS);
    }
  }

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

  /** Vorschau-URL (inline) – falls Header falsch, im Component Fallback über Blob */
  async getPreviewUrl(storagePath: string): Promise<string> {
    const u = await getDownloadURL(ref(this.storage, storagePath));
    // Für GCS/Firebase kannst du zusätzlich (meist) response Header setzen:
    const sep = u.includes('?') ? '&' : '?';
    return `${u}${sep}response-content-disposition=inline`;
  }

  /** Download-URL (erzwungen "attachment") */
  async getDownloadUrl(
    storagePath: string,
    fileName: string,
    forceOctet = false
  ): Promise<string> {
    const u = await getDownloadURL(ref(this.storage, storagePath));
    const url = new URL(u);
    url.searchParams.set(
      'response-content-disposition',
      `attachment; filename="${this.makeSafeName(fileName)}"`
    );
    url.searchParams.set(
      'response-content-type',
      forceOctet
        ? 'application/octet-stream'
        : this.guessContentType(fileName, '')
    );
    return url.toString();
  }

  // ---------- helpers ----------

  private makeSafeName(name: string): string {
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

  private guessContentType(fileName: string, fallback?: string) {
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      txt: 'text/plain',
      csv: 'text/csv',
      json: 'application/json',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
    };
    return map[ext] || fallback || 'application/octet-stream';
  }

  // Damit browser nicht dokument herunterlädt, wenn es dieses zur vorschau öffnen soll
  async fixOneByPath(storagePath: string, displayName?: string) {
    const objRef = ref(this.storage, storagePath);
    const md = await getMetadata(objRef).catch(() => ({} as any));
    const safeName = this.makeSafeName(
      displayName || storagePath.split('/').pop() || 'datei.pdf'
    );

    await updateMetadata(objRef, {
      contentType: md.contentType || 'application/pdf',
      contentDisposition: `inline; filename="${safeName}"`,
    });

    // Optional: neue URL ziehen (falls du sie im Firestore ablegen willst)
    await getDownloadURL(objRef);
  }

  /** Direkt den Blob aus dem Storage holen (ohne Cross-Origin Probleme). */
  async getBlobForPath(storagePath: string): Promise<Blob> {
    const objRef = ref(this.storage, storagePath);
    return await getBlob(objRef);
  }

  /** externe Vorschau-URL bauen */
  private buildPreviewUrl(
    rawDownloadUrl: string,
    contentType?: string
  ): string {
    const ct = (contentType || '').toLowerCase();

    // Für PDFs & Office: Google Docs Viewer nutzen (rendert zuverlässig, ignoriert attachment)
    const isDocLike =
      ct === 'application/pdf' ||
      ct.includes('officedocument') ||
      ct.includes('msword') ||
      ct.includes('excel') ||
      ct.includes('powerpoint') ||
      ct.includes('openxmlformats');

    if (isDocLike || rawDownloadUrl.toLowerCase().endsWith('.pdf')) {
      const u = new URL('https://docs.google.com/gview');
      u.searchParams.set('embedded', '1');
      u.searchParams.set('url', rawDownloadUrl); // signierte Firebase-URL
      return u.toString();
    }

    // Bilder/Videos meist direkt anzeigen okay (attachment wird in Subressourcen i.d.R. ignoriert)
    return rawDownloadUrl;
  }

  async viewDoc(doc: PropertyDoc): Promise<void> {
    const freshUrl = await this.refreshUrl(doc.id);
    const previewUrl = this.buildPreviewUrl(freshUrl, doc.contentType);
    window.open(previewUrl, '_blank', 'noopener');
  }

  async downloadDoc(doc: PropertyDoc): Promise<void> {
    const freshUrl = await this.refreshUrl(doc.id);
    // im selben Tab oder neuem Tab ist egal – der Server zwingt „Download“
    const a = document.createElement('a');
    a.href = freshUrl;
    a.download = doc.displayName || doc.fileName; // wird evtl. ignoriert, Header gewinnt – ok
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

}
