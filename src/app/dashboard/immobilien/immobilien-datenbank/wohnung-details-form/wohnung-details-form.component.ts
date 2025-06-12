import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Immobilie, WohnungDetails } from '../../../../models/immobilie.model';
import { MATERIAL_MODULES } from '../../../../shared/material-imports';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { ImmobilienService } from '../../../../services/immobilien.service';
import { MediaAttachment } from '../../../../models/media.model';
import { CustomerService } from '../../../../services/customer.service';
import { Customer, CustomerRole } from '../../../../models/customer.model';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { ImmoEditHeaderComponent } from '../shared/immo-edit-header/immo-edit-header.component';

@Component({
  selector: 'app-wohnung-details-form',
  standalone: true,
  imports: [MATERIAL_MODULES, CommonModule, RouterModule, ImmoEditHeaderComponent],
  templateUrl: './wohnung-details-form.component.html',
  styleUrl: './wohnung-details-form.component.scss',
})
export class WohnungDetailsFormComponent {
  immobilie!: Immobilie;
  wohnung!: WohnungDetails;
  uploadedMedia: MediaAttachment[] = [];
  titleImageId: string | number | null = null;
  exposePdfUrl: string | null = null;
  successMessage = '';
  errorMessage = '';
  owners: Customer[] = [];
  vertretendePersonen: Customer[] = [];
  tenants: Customer[] = [];

  constructor(
    private route: ActivatedRoute,
    private immobilienService: ImmobilienService,
    private customerService: CustomerService,
    private firebaseService: FirebaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    const externalId = this.route.snapshot.paramMap.get('externalId');
    if (externalId) {
      this.loadWohnung(externalId);
      await this.loadOwners();
      await this.loadVertretende();
      await this.loadTenants();
    }
  }

  async loadOwners(): Promise<void> {
    const allCustomers = await this.customerService.getAllCustomers();
    this.owners = allCustomers.filter(
      (c) =>
        c.roles?.includes(CustomerRole.Verkäufer) ||
        c.roles?.includes(CustomerRole.Eigentümer)
    );
  }

  async loadVertretende(): Promise<void> {
    const allCustomers = await this.customerService.getAllCustomers();
    this.vertretendePersonen = allCustomers.filter((c) =>
      c.roles?.includes(CustomerRole.Vertretung)
    );
  }

  async loadTenants(): Promise<void> {
    const allCustomers = await this.customerService.getAllCustomers();
    this.tenants = allCustomers.filter((c) =>
      c.roles?.includes(CustomerRole.Mieter)
    );
  }

  private syncImmobilieToWohnung(): void {
    if (!this.immobilie || !this.wohnung) return;

    this.wohnung.externalId = this.immobilie.externalId;
    this.wohnung.title = this.immobilie.title;
    this.wohnung.street = this.immobilie.street;
    this.wohnung.houseNumber = this.immobilie.houseNumber;
    this.wohnung.postcode = this.immobilie.postcode;
    this.wohnung.city = this.immobilie.city;
    this.wohnung.value = this.immobilie.value;
    this.wohnung.livingSpace = this.immobilie.livingSpace;
    this.wohnung.numberOfRooms = this.immobilie.numberOfRooms;
    this.wohnung.hasCourtage = this.immobilie.hasCourtage;
    this.wohnung.courtage = this.immobilie.courtage;
    this.wohnung.courtageNote = this.immobilie.courtageNote;
    this.wohnung.creationDate = this.immobilie.creationDate;
    this.wohnung.lastModificationDate = this.immobilie.lastModificationDate;
    this.wohnung.descriptionNote = this.immobilie.descriptionNote;
  }

  getCheckboxValue(obj: any, key: string): boolean {
    return obj[key] === 'YES';
  }

  setCheckboxValue(obj: any, key: string, checked: boolean): void {
    obj[key] = checked ? 'YES' : 'NOT_APPLICABLE';
  }

  async loadWohnung(externalId: string): Promise<void> {
    try {
      const fullData = await this.immobilienService.getProperty(externalId);
      this.immobilie = fullData;
      this.wohnung = fullData.apartmentDetails;
  
      this.uploadedMedia = await new Promise<any[]>((resolve, reject) => {
        this.immobilienService.getMediaByExternalId(externalId).subscribe({
          next: (media) => resolve(media),
          error: (err) => reject(err),
        });
      });
  
      const titleImage = this.uploadedMedia.find((m) => m.isTitleImage);
      this.titleImageId = titleImage?.id || null;
  
      const url = this.immobilie.exposePdfUrl ?? null;
  
      // 🧠 Nur wenn URL existiert und Datei auch wirklich da ist
      if (url && await this.firebaseService.checkPdfExistsWithFirebase(url)) {
        this.exposePdfUrl = url;
      } else {
        this.exposePdfUrl = null; // 🔥 Setze sie explizit auf null
      }
  
    } catch (error) {
      this.errorMessage = 'Fehler beim Laden der Daten';
      console.error(error);
    }
  }
  

  
  async saveWohnung(): Promise<void> {
    try {
      this.syncImmobilieToWohnung();
  
      const response = await this.immobilienService.saveWohnung(
        this.immobilie,
        this.wohnung
      );
  
      if (!response.success)
        throw new Error(response.error || 'Unbekannter Fehler');
  
      this.successMessage = 'Wohnung erfolgreich aktualisiert';
      alert('✅ Änderungen wurden erfolgreich gespeichert.');
  
      if (this.titleImageId) {
        await this.immobilienService.setTitleImage(
          this.titleImageId.toString(),
          this.immobilie.externalId!
        );
      }
    } catch (error) {
      this.errorMessage = 'Fehler beim Speichern';
      alert('❌ Fehler beim Speichern der Änderungen.');
      console.error(error);
    }
  }
  

  async deleteWohnung(): Promise<void> {
    if (!this.immobilie?.externalId) return;

    const confirmed = confirm('Willst du diese Immobilie wirklich löschen?');
    if (!confirmed) return;

    try {
      const result = await this.immobilienService.deleteImmobilie(
        this.immobilie.externalId
      );
      if (result.success) {
        alert('Immobilie wurde gelöscht.');
        // Optional: Zurück zur Übersicht navigieren
      } else {
        this.errorMessage = result.error || 'Löschen fehlgeschlagen';
      }
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
      this.errorMessage = 'Fehler beim Löschen';
    }
  }


}
