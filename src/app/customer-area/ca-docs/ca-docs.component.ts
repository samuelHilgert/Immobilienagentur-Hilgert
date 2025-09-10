import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PropertyDocsService,
  PropertyDoc,
} from '../../services/property-docs.service';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

type UiGroup = {
  key: string;
  label: string;
  items: PropertyDoc[];
  isImageGroup: boolean;
};

@Component({
  selector: 'app-ca-docs',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './ca-docs.component.html',
  styleUrl: './ca-docs.component.scss',
})
export class CaDocsComponent implements OnInit {
  @Input() externalId!: string;

  loading = true;
  error: string | null = null;
  docs: PropertyDoc[] = [];

  // Gruppierte Sicht inkl. Flag, ob reine Bild-Kategorie
  grouped: UiGroup[] = [];

  downloadingAll = false;
  bulkProgress = { done: 0, total: 0, current: '' };

  constructor(
    public docsSvc: PropertyDocsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    this.externalId = this.externalId || this.data?.externalId;
    if (!this.externalId) {
      this.error = 'Keine Objekt-ID übergeben.';
      this.loading = false;
      return;
    }

    try {
      this.docs = await this.docsSvc.listForProperty(this.externalId);

      // ⚠️ Filter: nur Dokumente anzeigen, bei denen extendedAccess !== true
      this.docs = this.docs.filter((d) => !d.extendedAccess);
    } catch (e) {
      console.error(e);
      this.error = 'Dokumente konnten nicht geladen werden.';
    } finally {
      this.buildGroups(); // wichtig, gruppiert nur die gefilterten Docs
      this.loading = false;
    }
  }

  trackByDocId = (_: number, d: PropertyDoc) => d.id || d.storagePath;

  async previewDoc(doc: PropertyDoc) {
    try {
      await this.docsSvc.viewDoc(doc);
    } catch {
      try {
        window.open(
          await this.docsSvc.refreshUrl(doc.id),
          '_blank',
          'noopener'
        );
      } catch {}
    }
  }

  async downloadDoc(doc: PropertyDoc) {
    try {
      const freshUrl = await this.docsSvc.refreshUrl(doc.id);
      const a = document.createElement('a');
      a.href = freshUrl;
      a.download = (doc.displayName || doc.fileName || 'datei').replace(
        /[\/\\:#?"<>|]+/g,
        '_'
      );
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      window.open(doc.url, '_blank', 'noopener');
    }
  }

  async downloadAll() {
    if (!this.docs?.length) return;
    this.downloadingAll = true;
    this.bulkProgress = { done: 0, total: this.docs.length, current: '' };
    try {
      for (const d of this.docs) {
        this.bulkProgress.current = d.displayName || d.fileName || 'Datei';
        const freshUrl = await this.docsSvc.refreshUrl(d.id).catch(() => d.url);
        const a = document.createElement('a');
        a.href = freshUrl;
        a.rel = 'noopener';
        a.download = (d.displayName || d.fileName || 'datei').replace(
          /[\/\\:#?"<>|]+/g,
          '_'
        );
        document.body.appendChild(a);
        a.click();
        a.remove();
        await this.sleep(400);
        this.bulkProgress.done++;
      }
    } finally {
      this.downloadingAll = false;
      this.bulkProgress.current = '';
    }
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  /** Gruppierung: "Ohne Kategorie" zuerst, gemischte Kategorien normal sortiert,
   * reine Bild-Kategorien (nur image/*) am Ende + Flag für CSS */
  private buildGroups() {
    const map = new Map<string, PropertyDoc[]>();

    for (const d of this.docs) {
      const key = d.folder && d.folder.trim() ? d.folder.trim() : '__none__';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }

    // Helper in Scope (kein this nötig)
    const isImageDoc = (doc: PropertyDoc) =>
      (doc?.contentType || '').startsWith('image/');

    // innerhalb jeder Gruppe: zuerst Datum (desc), optional Bilder ans Ende
    for (const arr of map.values()) {
      arr.sort((a, b) =>
        (b.uploadDate || '').localeCompare(a.uploadDate || '')
      );
      // optional: Bilder innerhalb der Gruppe unten einsortieren
      arr.sort((a, b) => (isImageDoc(a) ? 1 : 0) - (isImageDoc(b) ? 1 : 0));
    }

    const labelFor = (k: string) =>
      k === '__none__' ? 'Ohne Kategorie' : k.replace(/\//g, ' / ');

    const groups: UiGroup[] = Array.from(map.entries()).map(([key, items]) => ({
      key,
      label: labelFor(key),
      items,
      isImageGroup: items.every(isImageDoc),
    }));

    const normal = groups
      .filter((g) => !g.isImageGroup)
      .sort((a, b) => {
        if (a.key === '__none__' && b.key !== '__none__') return -1;
        if (b.key === '__none__' && a.key !== '__none__') return 1;
        return a.key.localeCompare(b.key, undefined, { sensitivity: 'base' });
      });

    const images = groups
      .filter((g) => g.isImageGroup)
      .sort((a, b) =>
        a.key.localeCompare(b.key, undefined, { sensitivity: 'base' })
      );

    this.grouped = [...normal, ...images];
  }

  /** Prüft, ob ein Dokument „neu“ ist */
  isNewDoc(doc: PropertyDoc, testDurationSec?: number): boolean {
    if (!doc.extendedAccessChangedAt) return false;

    const now = Date.now();
    const durationMs =
      testDurationSec !== undefined
        ? testDurationSec * 1000
        : 3 * 24 * 60 * 60 * 1000; // 3 Tage default
    return now - doc.extendedAccessChangedAt <= durationMs;
  }
}
