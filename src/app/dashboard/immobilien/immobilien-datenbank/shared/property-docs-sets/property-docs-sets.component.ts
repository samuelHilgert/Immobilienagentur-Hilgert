// src/app/.../property-docs-sets/property-docs-sets.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { ImmobilienService } from '../../../../../services/immobilien.service';
import { Immobilie } from '../../../../../models/immobilie.model';
import {
  PropertyDocsService,
  PropertyDoc,
} from '../../../../../services/property-docs.service';
import { MATERIAL_MODULES } from '../../../../../shared/material-imports';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-property-docs-sets',
  standalone: true,
  imports: [CommonModule, RouterModule, MATERIAL_MODULES],
  templateUrl: './property-docs-sets.component.html',
  styleUrl: './property-docs-sets.component.scss',
})
export class PropertyDocsSetsComponent implements OnInit {
  @Input() immobilienId!: string;
  immobilie?: Immobilie;
  isAdmin = false;
  isLoading = true;
  grouped: Array<{ key: string; label: string; items: PropertyDoc[] }> = [];

  docs: PropertyDoc[] = [];
  uploading = false;
  uploadProgress: { done: number; total: number; current: string } = {
    done: 0,
    total: 0,
    current: '',
  };
  folderInput = '';

  // fürs Löschen
  deletingAll = false;
  deleteProgress: { done: number; total: number; current: string } = {
    done: 0,
    total: 0,
    current: '',
  };
  deleteErrors: string[] = [];

  constructor(
    private immobilienService: ImmobilienService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private docsSvc: PropertyDocsService
  ) {}

  async ngOnInit() {
    this.immobilienId = this.route.snapshot.paramMap.get('externalId') || '';
    if (!this.immobilienId) {
      this.isLoading = false;
      return;
    }

    this.authService.isAdmin().subscribe(async (isAdmin) => {
      this.isAdmin = isAdmin;
      if (!isAdmin) {
        console.warn(
          '⛔ Zugriff verweigert – nur Admins dürfen Dokumente verwalten'
        );
        this.isLoading = false;
        return;
      }

      try {
        this.immobilie = await this.immobilienService.getImmobilieById(
          this.immobilienId
        );
        await this.loadDocs();
      } catch (error) {
        console.error('❌ Fehler beim Laden:', error);
      } finally {
        this.isLoading = false;
      }
    });
  }

  async loadDocs() {
    try {
      this.docs = await this.docsSvc.listForProperty(this.immobilienId);
    } catch (e) {
      console.warn('Falle auf Storage-Liste zurück:', e);
      this.docs = await this.docsSvc.listFromStorageOnly(this.immobilienId);
    } finally {
      this.buildGroups(); // <— WICHTIG
    }
  }

  async fixThatOne() {
    await this.docsSvc.fixOneByPath(
      'property-docs/23523/23523_1756239063016_Versicherungspolice2.pdf',
      'Versicherungspolice2.pdf'
    );
    // danach neu laden
    await this.loadDocs();
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.uploading = true;
    this.uploadProgress = { done: 0, total: input.files.length, current: '' };

    try {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.uploadProgress.current = file.name;

        const res = await this.docsSvc.uploadDoc(file, {
          externalId: this.immobilienId,
          folder: this.folderInput || null, // ← Kategorie getrennt übergeben
          // displayName: optional – wenn du willst
        });

        if (!res.success) {
          console.error('❌ Upload fehlgeschlagen für', file.name, res.error);
        }

        this.uploadProgress.done++;
        await this.sleep(50);
      }

      await this.loadDocs();
      input.value = '';
    } catch (e) {
      console.error('Upload fehlgeschlagen:', e);
      alert('Upload fehlgeschlagen.');
    } finally {
      this.uploading = false;
      this.uploadProgress.current = '';
    }
  }

  async rename(doc: PropertyDoc) {
    const newName = prompt(
      'Neuer Anzeigename (Dateiendung optional):',
      doc.displayName
    );
    if (!newName || newName.trim() === '' || newName === doc.displayName)
      return;

    try {
      await this.docsSvc.renameDoc(doc.id, newName.trim(), true);
      await this.loadDocs();
    } catch (e) {
      console.error('Umbenennen fehlgeschlagen:', e);
      alert('Umbenennen fehlgeschlagen.');
    }
  }

  async remove(doc: PropertyDoc) {
    const ok = confirm(
      `Dokument „${doc.displayName || doc.fileName}“ wirklich löschen?`
    );
    if (!ok) return;

    try {
      await this.docsSvc.deleteDoc(doc.id);
      await this.loadDocs();
    } catch (e) {
      console.error('Löschen fehlgeschlagen:', e);
      alert('Löschen fehlgeschlagen.');
    }
  }

  /** Vorschau in neuem Tab: **/
  async preview(doc: PropertyDoc) {
    try {
      await this.docsSvc.viewDoc(doc); // ← statt getPreviewUrl(...)
    } catch (e) {
      console.error('Vorschau fehlgeschlagen:', e);
      alert('Vorschau nicht möglich.');
    }
  }

  /** Expliziter Download (attachment) mit sauberem Dateinamen */
  async download(doc: PropertyDoc) {
    try {
      const freshUrl = await this.docsSvc.refreshUrl(doc.id);
      // gleiche Seite navigieren → Browser triggert Download, kein leeres Tab
      const a = document.createElement('a');
      a.href = freshUrl;
      a.download = doc.displayName || doc.fileName; // Header (attachment) gewinnt eh
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error('Download fehlgeschlagen:', e);
      alert('Download fehlgeschlagen.');
    }
  }

  /** interner Helfer: Blob holen (ohne öffentliches Token zu exponieren) */
  // private async fetchBlob(storagePath: string): Promise<Blob> {
  //   // kleiner Trick: wir nutzen die öffentliche URL (token-basiert),
  //   // oder – wenn du es restriktiver willst – baue hier eine Cloud Function.
  //   const url = await this.docsSvc.getPreviewUrl(storagePath);
  //   const res = await fetch(url);
  //   if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //   return await res.blob();
  // }

  // fürs Löschen aller Dokumente gleichzeitig
  async removeAll() {
    if (!this.docs.length) return;

    // doppelte Absicherung
    const ok = confirm(
      `Wirklich ALLE ${this.docs.length} Dokumente löschen? Dies kann nicht rückgängig gemacht werden.`
    );
    if (!ok) return;

    this.deletingAll = true;
    this.deleteErrors = [];
    this.deleteProgress = { done: 0, total: this.docs.length, current: '' };

    try {
      const { errors } = await this.docsSvc.deleteAllForProperty(
        this.immobilienId,
        (p) => (this.deleteProgress = { ...p, current: p.current || '' })
      );
      this.deleteErrors = errors;
      await this.loadDocs();
    } catch (e) {
      alert('Massenlöschung fehlgeschlagen.');
      console.error(e);
    } finally {
      this.deletingAll = false;
      this.deleteProgress.current = '';
    }
  }

  private buildGroups() {
    const map = new Map<string, PropertyDoc[]>();

    for (const d of this.docs) {
      const key = d.folder && d.folder.trim() ? d.folder.trim() : '__none__';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }

    // innerhalb jeder Gruppe sortieren (z.B. nach Datum absteigend)
    for (const arr of map.values()) {
      arr.sort((a, b) =>
        (b.uploadDate || '').localeCompare(a.uploadDate || '')
      );
    }

    const labelFor = (k: string) =>
      k === '__none__' ? 'Ohne Kategorie' : k.replace(/\//g, ' / ');

    this.grouped = Array.from(map.entries())
      .sort((a, b) => {
        if (a[0] === '__none__' && b[0] !== '__none__') return -1; // „Ohne Kategorie“ zuerst
        if (b[0] === '__none__' && a[0] !== '__none__') return 1;
        return a[0].localeCompare(b[0], undefined, { sensitivity: 'base' });
      })
      .map(([key, items]) => ({ key, label: labelFor(key), items }));
  }

  trackByDocId = (_: number, d: PropertyDoc) => d.id || d.storagePath;

  // async changeFolder(
  //   docId: string,
  //   newFolder: string | null
  // ): Promise<void> {
  //   const refFS = doc(this.db, 'property-docs', docId);
  //   const snap = await getDoc(refFS);
  //   if (!snap.exists()) throw new Error('Dokument nicht gefunden');
  
  //   const clean = (newFolder ?? '').trim();
  //   const folderClean = clean ? this.makeSafePath(clean) : null;
  
  //   await updateDoc(refFS, { folder: folderClean });
  // }

  async changeCategory(d: PropertyDoc) {
    const val = prompt(
      'Neue Kategorie (z. B. Rechnungen/2025), leer für keine:',
      d.folder || ''
    );
    if (val === null) return;

    // ✅ nur Metadatum „folder“ ändern (kein physisches Verschieben)
    await this.docsSvc.changeFolder(d.id, val.trim() || null);

    await this.loadDocs();
  }
  
}
