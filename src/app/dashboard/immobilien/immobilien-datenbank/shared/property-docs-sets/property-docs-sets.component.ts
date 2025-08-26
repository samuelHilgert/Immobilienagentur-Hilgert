// src/app/dashboard/immobilien/immobilien-datenbank/shared/property-docs-sets/property-docs-sets.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { ImmobilienService } from '../../../../../services/immobilien.service';
import { Immobilie } from '../../../../../models/immobilie.model';
import { PropertyDocsService, PropertyDoc } from '../../../../../services/property-docs.service';

@Component({
  selector: 'app-property-docs-sets',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-docs-sets.component.html',
  styleUrl: './property-docs-sets.component.scss'
})
export class PropertyDocsSetsComponent implements OnInit {
  @Input() immobilienId!: string;
  immobilie?: Immobilie;
  isAdmin = false;
  isLoading = true;

  docs: PropertyDoc[] = [];
  uploading = false;

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
        console.warn('⛔ Zugriff verweigert – nur Admins dürfen Dokumente verwalten');
        this.isLoading = false;
        return;
      }

      try {
        this.immobilie = await this.immobilienService.getImmobilieById(this.immobilienId);
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
    }
  }

  // === Aktionen ===
  view(doc: PropertyDoc) {
    window.open(doc.url, '_blank');
  }

  async rename(doc: PropertyDoc) {
    const newName = prompt('Neuer Anzeigename (Dateiendung optional):', doc.displayName);
    if (!newName || newName.trim() === '' || newName === doc.displayName) return;

    try {
      // Nur Anzeigename ändern (schnell & ohne Copy/Delete); wenn du echte Umbenennung willst, dritten Parameter auf false setzen
      await this.docsSvc.renameDoc(doc.id, newName.trim(), true);
      await this.loadDocs();
    } catch (e) {
      console.error('Umbenennen fehlgeschlagen:', e);
      alert('Umbenennen fehlgeschlagen.');
    }
  }

  async remove(doc: PropertyDoc) {
    const ok = confirm(`Dokument „${doc.displayName || doc.fileName}“ wirklich löschen?`);
    if (!ok) return;

    try {
      await this.docsSvc.deleteDoc(doc.id);
      await this.loadDocs();
    } catch (e) {
      console.error('Löschen fehlgeschlagen:', e);
      alert('Löschen fehlgeschlagen.');
    }
  }

  async onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.uploading = true;
    try {
      const res = await this.docsSvc.uploadDoc(file, this.immobilienId);
      if (!res.success) throw res.error;
      await this.loadDocs();
      // Input zurücksetzen, sonst feuert change nicht nochmal bei gleicher Datei
      input.value = '';
    } catch (e) {
      console.error('Upload fehlgeschlagen:', e);
      alert('Upload fehlgeschlagen.');
    } finally {
      this.uploading = false;
    }
  }
}
