// ca-docs.component.ts
import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyDocsService, PropertyDoc } from '../../services/property-docs.service';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ca-docs',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './ca-docs.component.html',
  styleUrl: './ca-docs.component.scss'
})
export class CaDocsComponent implements OnInit {
  @Input() externalId!: string;

  loading = true;
  error: string | null = null;
  docs: PropertyDoc[] = [];

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
      a.download = (doc.displayName || doc.fileName || 'datei').replace(/[\/\\:#?"<>|]+/g, '_');
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
}
