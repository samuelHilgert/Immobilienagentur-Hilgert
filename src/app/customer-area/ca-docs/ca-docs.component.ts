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
  /** Externe ID der Immobilie – wird vom Exposé übergeben */
  @Input() externalId!: string;

  loading = true;
  error: string | null = null;
  docs: PropertyDoc[] = [];

  constructor(private docsSvc: PropertyDocsService, @Inject(MAT_DIALOG_DATA) public data: any) {}

  async ngOnInit() {
    // Fallback: wenn kein @Input gesetzt ist, nimm die Dialog-Daten
    this.externalId = this.externalId || this.data?.externalId;
  
    if (!this.externalId) {
      this.error = 'Keine Objekt-ID übergeben.';
      this.loading = false;
      return;
    }
    try {
      this.docs = await this.docsSvc.listForProperty(this.externalId);
    } catch (e: any) {
      console.error(e);
      this.error = 'Dokumente konnten nicht geladen werden.';
    } finally {
      this.loading = false;
    }
  }  

  /** Fallback, falls URL abgelaufen ist */
  async refreshUrl(doc: PropertyDoc) {
    try {
      const fresh = await this.docsSvc.refreshUrl(doc.id);
      doc.url = fresh;
    } catch {
      // still fine – die alte URL bleibt stehen
    }
  }

  async downloadDoc(d: PropertyDoc) {
    try {
      // Optional frisch holen, falls abgelaufen:
      // d.url = await this.docsSvc.refreshUrl(d.id);
  
      const res = await fetch(d.url, { mode: 'cors' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
  
      const tmpUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = tmpUrl;
      a.download = (d.displayName || d.fileName || 'datei').replace(/[\/\\:#?"<>|]+/g, '_');
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(tmpUrl);
    } catch (e) {
      console.error('Download fehlgeschlagen:', e);
      // Fallback: wenigstens öffnen
      window.open(d.url, '_blank');
    }
  }
  
}
