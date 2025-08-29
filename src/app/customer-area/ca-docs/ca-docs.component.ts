// ca-docs.component.ts
import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PropertyDocsService,
  PropertyDoc,
} from '../../services/property-docs.service';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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
      // Holt bereits frische URLs (du hast das im Service so implementiert)
      this.docs = await this.docsSvc.listForProperty(this.externalId);
    } catch (e) {
      console.error(e);
      this.error = 'Dokumente konnten nicht geladen werden.';
    } finally {
      this.loading = false;
    }
  }

  /** Vorschau in neuem Tab (nutzt Service-Logik inkl. Google Viewer bei PDFs/Office) */
  async previewDoc(doc: PropertyDoc) {
    try {
      await this.docsSvc.viewDoc(doc);
    } catch (e) {
      console.error('Vorschau fehlgeschlagen:', e);
      // Fallback: frische URL öffnen
      try {
        const fresh = await this.docsSvc.refreshUrl(doc.id);
        window.open(fresh, '_blank', 'noopener');
      } catch {}
    }
  }

  /** Download (Server sendet attachment; Dateiname per a.download gesetzt) */
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
    } catch (e) {
      console.error('Download fehlgeschlagen:', e);
      // Letzter Fallback: öffnen
      window.open(doc.url, '_blank', 'noopener');
    }
  }

  /** Optional: einzelne URL manuell erneuern (Button „Link aktualisieren“) */
  async refreshUrl(doc: PropertyDoc) {
    try {
      doc.url = await this.docsSvc.refreshUrl(doc.id);
    } catch {}
  }
  
  async downloadAll() {
    if (!this.docs?.length) return;
  
    this.downloadingAll = true;
    this.bulkProgress = { done: 0, total: this.docs.length, current: '' };
  
    try {
      // Wichtig: NACHEINANDER, damit Pop-Up Blocker/Browser-Rate-Limits nicht greifen
      for (const d of this.docs) {
        this.bulkProgress.current = d.displayName || d.fileName || 'Datei';
  
        // 1) Frische, "attachment"-URL bauen (wie bei Einzel-Download)
        //    Falls du strikt per storagePath gehen willst:
        //    const freshUrl = await this.docsSvc.getDownloadUrl(d.storagePath, d.displayName || d.fileName, true);
        const freshUrl = await this.docsSvc.refreshUrl(d.id).catch(() => d.url);
  
        // 2) Download per <a> Navigation (kein XHR ⇒ kein CORS)
        const a = document.createElement('a');
        a.href = freshUrl;
        a.rel = 'noopener';
        // Dateiname (Browser darf ignorieren, Header gewinnt – passt)
        a.download = (d.displayName || d.fileName || 'datei').replace(/[\/\\:#?"<>|]+/g, '_');
        document.body.appendChild(a);
        a.click();
        a.remove();
  
        // 3) Kleiner Delay, damit Browser nicht blockt (Safari/Chrome mögen das)
        await this.sleep(400);
  
        this.bulkProgress.done++;
      }
    } catch (e) {
      console.error('Bulk-Download fehlgeschlagen:', e);
      this.error = 'Mindestens ein Download konnte nicht gestartet werden.';
    } finally {
      this.downloadingAll = false;
      this.bulkProgress.current = '';
    }
  }

  private sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }
}
