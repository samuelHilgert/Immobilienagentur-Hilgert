import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../../../../shared/material-imports';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ImmobilienService } from '../../../../services/immobilien.service';
import { HausDetails, Immobilie } from '../../../../models/immobilie.model';
import { MediaAttachment } from '../../../../models/media.model';
import { Customer, CustomerRole } from '../../../../models/customer.model';
import { CustomerService } from '../../../../services/customer.service';
import { ImmoEditHeaderComponent } from '../shared/immo-edit-header/immo-edit-header.component';
import { FirebaseService } from '../../../../services/firebase.service';

@Component({
  selector: 'app-haus-details-form',
  standalone:true,
  imports: [MATERIAL_MODULES, CommonModule, RouterModule, ImmoEditHeaderComponent],
  templateUrl: './haus-details-form.component.html',
  styleUrl: './haus-details-form.component.scss'
})
export class HausDetailsFormComponent {
  immobilie!: Immobilie;
  haus!: HausDetails;
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
    private firebaseService: FirebaseService
  ) {}

  async ngOnInit(): Promise<void> {
    const externalId = this.route.snapshot.paramMap.get('externalId');
    if (externalId) {
      this.loadHaus(externalId);
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
    this.vertretendePersonen = allCustomers.filter(
      (c) => c.roles?.includes(CustomerRole.Vertretung)
    );
  }

  async loadTenants(): Promise<void> {
    const allCustomers = await this.customerService.getAllCustomers();
    this.tenants = allCustomers.filter((c) =>
      c.roles?.includes(CustomerRole.Mieter)
    );
  }

  private syncImmobilieToHaus(): void {
    if (!this.immobilie || !this.haus) return;

    this.haus.externalId = this.immobilie.externalId;
    this.haus.title = this.immobilie.title;
    this.haus.street = this.immobilie.street;
    this.haus.houseNumber = this.immobilie.houseNumber;
    this.haus.postcode = this.immobilie.postcode;
    this.haus.city = this.immobilie.city;
    this.haus.value = this.immobilie.value;
    this.haus.livingSpace = this.immobilie.livingSpace;
    this.haus.plotArea = this.immobilie.plotArea;
    this.haus.numberOfRooms = this.immobilie.numberOfRooms;
    this.haus.hasCourtage = this.immobilie.hasCourtage;
    this.haus.courtage = this.immobilie.courtage;
    this.haus.courtageNote = this.immobilie.courtageNote;
    this.haus.creationDate = this.immobilie.creationDate;
    this.haus.lastModificationDate = this.immobilie.lastModificationDate;
    this.haus.descriptionNote = this.immobilie.descriptionNote;
    this.haus.latitude = this.immobilie.latitude;
    this.haus.longitude = this.immobilie.longitude;
    this.haus.latitudeWithNo = this.immobilie.latitudeWithNo;
    this.haus.longitudeWithNo = this.immobilie.longitudeWithNo;
  }

  getCheckboxValue(obj: any, key: string): boolean {
    return obj[key] === 'YES';
  }

  setCheckboxValue(obj: any, key: string, checked: boolean): void {
    obj[key] = checked ? 'YES' : 'NOT_APPLICABLE';
  }

  async loadHaus(externalId: string): Promise<void> {
    try {
      const fullData = await this.immobilienService.getProperty(externalId);
      this.immobilie = fullData;
      this.haus = fullData.houseDetails;
  
      this.uploadedMedia = await new Promise<MediaAttachment[]>((resolve, reject) => {
        this.immobilienService.getMediaByExternalId(externalId).subscribe({
          next: (media) => resolve(media),
          error: (err) => reject(err),
        });
      });
  
      const titleImage = this.uploadedMedia.find((m) => m.isTitleImage);
      this.titleImageId = titleImage?.id || null;
  
      const url = this.immobilie.exposePdfUrl ?? null;
  
      // Nur anzeigen, wenn PDF wirklich vorhanden ist – aber NICHT extendedExposeAvailable manipulieren!
      if (url && await this.firebaseService.checkPdfExistsWithFirebase(url)) {
        this.exposePdfUrl = url;
      } else {
        this.exposePdfUrl = null;
      }
  
    } catch (error) {
      this.errorMessage = 'Fehler beim Laden der Haus-Daten';
      console.error(error);
    }
  }  
  

  async saveHaus(): Promise<void> {
    try {
      this.syncImmobilieToHaus();
  
      const response = await this.immobilienService.saveHaus(this.immobilie, this.haus);
      if (!response.success) throw new Error(response.error || 'Unbekannter Fehler');
  
      this.successMessage = 'Haus erfolgreich aktualisiert';
      alert('✅ Änderungen wurden erfolgreich gespeichert.');
  
      if (this.titleImageId) {
        await this.immobilienService.setTitleImage(this.titleImageId.toString(), this.immobilie.externalId!);
      }
    } catch (error) {
      this.errorMessage = 'Fehler beim Speichern';
      alert('❌ Fehler beim Speichern der Änderungen.');
      console.error(error);
    }
  }  

  async deleteHaus(): Promise<void> {
    if (!this.immobilie?.externalId) return;
  
    const confirmed = confirm('Willst du dieses Haus wirklich löschen?');
    if (!confirmed) return;
  
    try {
      const result = await this.immobilienService.deleteImmobilie(this.immobilie.externalId);
      if (result.success) {
        alert('Haus wurde gelöscht.');
        // Optional: Navigation zur Übersichtsseite
      } else {
        this.errorMessage = result.error || 'Löschen fehlgeschlagen';
      }
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
      this.errorMessage = 'Fehler beim Löschen';
    }
  }


  
}