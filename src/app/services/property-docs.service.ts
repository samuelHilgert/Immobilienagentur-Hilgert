import JSZip from 'jszip';
import { saveAs } from 'file-saver';
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
  folder?: string | null;
  extendedAccess: boolean;
  extendedAccessChangedAt?: number; // Unix Timestamp in ms
}

@Injectable({ providedIn: 'root' })
export class PropertyDocsService {
  private app = initializeApp(environment.firebase);
  private db = getFirestore(this.app);
  private storage = getStorage(this.app);

  async listForProperty(externalId: string): Promise<PropertyDoc[]> {
    const col = collection(this.db, 'property-docs');
    const qy = query(
      col,
      where('externalId', '==', externalId),
      orderBy('uploadDate', 'desc')
    );
    const snap = await getDocs(qy);

    const docs = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PropertyDoc, 'id'>),
    }));

    // Alle URLs frisch holen
    await Promise.all(
      docs.map(async (doc) => {
        try {
          doc.url = await getDownloadURL(ref(this.storage, doc.storagePath));
        } catch (e) {
          console.warn('getDownloadURL failed for', doc.storagePath, e);
        }
      })
    );

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
    opts: { externalId: string; folder?: string | null; displayName?: string; extendedAccess?: boolean }
  ): Promise<{ success: boolean; doc?: PropertyDoc; error?: any }> {
    try {
      const { externalId, extendedAccess = false } = opts;
      const ts = Date.now();
  
      const safeName = this.makeSafeName(file.name);
      const folderCleanRaw = (opts.folder ?? '').trim();
      const folderClean = folderCleanRaw ? this.makeSafePath(folderCleanRaw) : null;
  
      const fileName = `${externalId}_${ts}_${safeName}`;
      const storagePath = folderClean
        ? `property-docs/${externalId}/${folderClean}/${fileName}`
        : `property-docs/${externalId}/${fileName}`;
  
      const storageRef = ref(this.storage, storagePath);
      const contentType = this.guessContentType(file.name, '');
      const downloadName = this.makeSafeName(opts.displayName || file.name);
      const metadata = {
        contentType,
        contentDisposition: `attachment; filename="${downloadName}"`,
      };
  
      const snap = await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(snap.ref);
  
      const docId = `${externalId}_${ts}`;
  
      const base: PropertyDoc = {
        id: docId,
        externalId,
        fileName,
        displayName: opts.displayName || file.name,
        storagePath,
        url,
        contentType,
        size: file.size,
        uploadDate: new Date().toISOString(),
        folder: folderClean ?? null,
        extendedAccess,
      };
  
      await setDoc(doc(this.db, 'property-docs', docId), base);
      return { success: true, doc: base };
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
          contentDisposition: `attachment; filename="${this.makeSafeName(
            newName
          )}"`, // ← attachment!
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
      contentDisposition: `attachment; filename="${this.makeSafeName(
        newName
      )}"`, // ← attachment!
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

    // ⚠️ Update ist nice-to-have – bei fehlenden Rechten ignorieren
    try {
      await updateDoc(refFS, {
        url: newUrl,
        uploadDate: meta.uploadDate || new Date().toISOString(),
      });
    } catch (e) {
      // Permission? Egal – wir haben die frische URL, das reicht für Kunden.
      // Optional: console.warn('updateDoc ignored:', e);
    }

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

  async downloadAllAsZip(
    docs: PropertyDoc[],
    zipName = 'unterlagen.zip',
    onProgress?: (p: { done: number; total: number; current?: string }) => void
  ): Promise<void> {
    if (!docs?.length) throw new Error('Keine Dokumente vorhanden.');

    const zip = new JSZip();
    const used = new Map<string, number>();
    const makeUnique = (name: string) => {
      const base = this.makeSafeName(name || 'datei');
      const times = (used.get(base) || 0) + 1;
      used.set(base, times);
      if (times === 1) return base;
      const dot = base.lastIndexOf('.');
      return dot > 0
        ? `${base.slice(0, dot)}_${times}${base.slice(dot)}`
        : `${base}_${times}`;
    };

    let done = 0;
    const total = docs.length;
    const errors: string[] = [];

    for (const d of docs) {
      try {
        // (Optional) URL im Firestore aktualisieren – schadet nicht
        await this.refreshUrl(d.id).catch(() => {});

        // **WICHTIG:** Blob direkt aus Storage via SDK (kein fetch auf URL)
        const blob = await this.getBlobForPath(d.storagePath);

        const fname = makeUnique(
          d.displayName ||
            d.fileName ||
            d.storagePath.split('/').pop() ||
            'datei'
        );
        zip.file(fname, blob, { date: new Date(d.uploadDate || Date.now()) });
      } catch (e: any) {
        errors.push(
          `Fehler bei ${d.displayName || d.fileName || d.storagePath}: ${String(
            e?.message || e
          )}`
        );
      } finally {
        done++;
        onProgress?.({ done, total, current: d.displayName || d.fileName });
      }
    }

    // Nur wenn wirklich Fehler auftraten, eine einzige Fehlerliste beilegen
    if (errors.length) {
      zip.file('FEHLER_Liste.txt', errors.join('\n'));
    }

    const blobZip = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    saveAs(blobZip, this.makeSafeName(zipName));
  }

  // alle Dokumente mit einem Klick löschen
  async deleteAllForProperty(
    externalId: string,
    onProgress?: (p: { done: number; total: number; current?: string }) => void
  ): Promise<{ deleted: number; errors: string[] }> {
    // bevorzugt Firestore-Liste, sonst Fallback auf Storage
    let docs: PropertyDoc[] = [];
    try {
      docs = await this.listForProperty(externalId);
    } catch {
      docs = await this.listFromStorageOnly(externalId);
    }

    const total = docs.length;
    let done = 0;
    const errors: string[] = [];

    for (const d of docs) {
      try {
        // Standardweg: über Firestore-Dokument (kennt storagePath)
        if (d.id && d.storagePath) {
          await this.deleteDoc(d.id);
        } else if (d.storagePath) {
          // Fallback: nur Storage löschen, falls kein Firestore-Eintrag
          await deleteObject(ref(this.storage, d.storagePath));
        }
      } catch (e: any) {
        errors.push(
          `❌ ${d.displayName || d.fileName || d.storagePath}: ${String(
            e?.message || e
          )}`
        );
      } finally {
        done++;
        onProgress?.({ done, total, current: d.displayName || d.fileName });
      }
    }

    return { deleted: total - errors.length, errors };
  }

  private safeFolder(folder?: string): string {
    if (!folder) return '';
    return folder
      .trim()
      .replace(/^\/+|\/+$/g, '')         // leading/trailing slashes
      .replace(/[\\]+/g, '/')            // backslash -> slash
      .split('/')
      .map(seg => this.makeSafeName(seg)) // gleiche Sanitizer-Logik wie Dateiname
      .filter(Boolean)
      .join('/');
  }

  private makeSafePath(path: string): string {
    // erlaubt Unterordner via "/", säubert Segmente
    return path
      .split('/')
      .map(s => this.makeSafeName(s)) // deine bestehende makeSafeName nutzt
      .filter(Boolean)
      .join('/');
  }

  async moveDocToFolder(
    docId: string,
    newFolderRaw: string | null
  ): Promise<void> {
    const refFS = doc(this.db, 'property-docs', docId);
    const snap = await getDoc(refFS);
    if (!snap.exists()) throw new Error('Dokument nicht gefunden');
    const meta = snap.data() as PropertyDoc;
  
    const oldRef = ref(this.storage, meta.storagePath);
    const [blob, oldMd] = await Promise.all([getBlob(oldRef), getMetadata(oldRef)]);
  
    // Zielpfad bauen (Ordner säubern, gleiche Datei beibehalten)
    const clean = (newFolderRaw ?? '').trim();
    const folder = clean ? this.makeSafePath(clean) : null;
  
    const baseFolder = `property-docs/${meta.externalId}`;
    const newPath = folder ? `${baseFolder}/${folder}/${meta.fileName}`
                           : `${baseFolder}/${meta.fileName}`;
    const newRef = ref(this.storage, newPath);
  
    // Metadaten weiterreichen (falls nicht gesetzt, sinnvolle Defaults)
    const newMd = {
      contentType: oldMd.contentType || this.guessContentType(meta.fileName, ''),
      contentDisposition: oldMd.contentDisposition
        || `attachment; filename="${this.makeSafeName(meta.displayName || meta.fileName)}"`,
    };
  
    // Kopieren -> neue URL -> alt löschen
    await uploadBytes(newRef, blob, newMd);
    const newUrl = await getDownloadURL(newRef);
    await deleteObject(oldRef).catch(() => { /* tolerieren */ });
  
    // Firestore aktualisieren (folder NIE undefined speichern)
    await updateDoc(refFS, {
      folder: folder ?? null,
      storagePath: newPath,
      url: newUrl,
      contentType: newMd.contentType,
    });
  }

   /** Nur die Kategorie/den Ordner als Metadatum ändern (kein Storage-Move) */
   async changeFolder(docId: string, newFolder: string | null): Promise<void> {
    const refFS = doc(this.db, 'property-docs', docId);
    const snap = await getDoc(refFS);
    if (!snap.exists()) throw new Error('Dokument nicht gefunden');

    const clean = (newFolder ?? '').trim();
    const folderClean = clean ? this.makeSafePath(clean) : null;

    await updateDoc(refFS, { folder: folderClean });
  }

  async updateExtendedAccess(docId: string, value: boolean, timestamp?: number) {
    const ref = doc(this.db, 'property-docs', docId);
    const updateData: any = { extendedAccess: value };
    if (timestamp) updateData.extendedAccessChangedAt = timestamp;
  
    await updateDoc(ref, updateData);
  }
  
  
}
