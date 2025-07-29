import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { ImmobilienService } from '../../../../../services/immobilien.service';
import { CustomerService } from '../../../../../services/customer.service';
import {
  Immobilie,
  WohnungDetails,
} from '../../../../../models/immobilie.model';
import { Customer } from '../../../../../models/customer.model';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../../../../../shared/material-imports';
import { HttpClient } from '@angular/common/http';
import {
  addLogEntryToProcess,
  createLogEntry,
} from '../../../../../utils/log-entry.util';
import { PropertyInquiryProcess } from '../../../../../models/property-inquiry-process.model';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { createExposeAnswerMailPayload } from '../../../../../factories/expose-mail.factory';
import { ExposeAnfrageDto } from '../../../../../models/expose-anfrage.model';

@Component({
  selector: 'app-property-expose-sets',
  standalone: true,
  imports: [CommonModule, RouterModule, MATERIAL_MODULES],
  templateUrl: './property-expose-sets.component.html',
  styleUrl: './property-expose-sets.component.scss',
})

export class PropertyExposeSetsComponent implements OnInit {
  @Input() immobilienId!: string;
  immobilie?: Immobilie;
  exposePdfUrl: string | null = null;
  apartmentDetails?: WohnungDetails;
  customerSearch = '';
  allCustomers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  selectedCustomer?: Customer;

  constructor(
    private immobilienService: ImmobilienService,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private firestore: Firestore
  ) {}

  /**
   * Initializes the component by loading the property,
   * apartment details, expose URL and all customers.
   */
  async ngOnInit() {
    this.immobilienId = this.route.snapshot.paramMap.get('externalId') || '';
    if (!this.immobilienId) return;

    this.immobilie = await this.immobilienService.getImmobilieById(
      this.immobilienId
    );
    this.apartmentDetails = await this.immobilienService.getWohnungById(
      this.immobilienId
    );
    this.exposePdfUrl = this.immobilie.exposePdfUrl || null;

    // console.log('Expose URL:', this.exposePdfUrl); // 👉 hier wird die URL ausgegeben
    // console.log('Extended Exposé verfügbar:', this.immobilie.extendedExposeAvailable); // zusätzlich nützlich
    // console.log('Speichere autoExposeSend:', this.immobilie.autoExposeSend);

    this.allCustomers = await this.customerService.getAllCustomers();
  }

  /**
   * Uploads a new expose PDF to Firebase Storage and updates the property metadata.
   * @param event File input change event
   */
  async uploadExposePdf(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.immobilie?.externalId) return;

    const file = input.files[0];
    const result = await this.immobilienService.uploadExposePdf(
      file,
      this.immobilie.externalId
    );

    if (result.success && result.url) {
      this.exposePdfUrl = result.url;
      this.immobilie.exposePdfUrl = result.url;
      this.immobilie.extendedExposeAvailable = true;

      await this.immobilienService.updateProperty(this.immobilie.externalId, {
        exposePdfUrl: result.url,
        extendedExposeAvailable: true,
      });
      this.cdr.detectChanges();
    }
  }

  /**
   * Deletes the uploaded exposé PDF from Firebase Storage and updates the property metadata.
   */
  async deleteExposePdf(): Promise<void> {
    if (!this.exposePdfUrl || !this.immobilie?.externalId) return;
    if (!confirm('Möchtest du das Exposé wirklich löschen?')) return;

    const decodedUrl = decodeURIComponent(this.exposePdfUrl);
    const filePath = decodedUrl.split('/o/')[1].split('?')[0];
    const storage = getStorage();
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);

    await this.immobilienService.deleteStorageFolder(
      `expose-pdf/${this.immobilie.externalId}`
    );
    this.exposePdfUrl = null;
    this.immobilie.exposePdfUrl = null;
    this.immobilie.extendedExposeAvailable = false;
    this.cdr.detectChanges();
  }

  /**
   * Filters the customer list based on the current search input.
   */
  filterCustomers(): void {
    const term = this.customerSearch.toLowerCase();
    this.filteredCustomers = this.allCustomers.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.customerId.toLowerCase().includes(term)
    );
  }

  /**
   * Selects a customer and populates the search input with their name.
   * @param customer The customer that was clicked
   */
  selectCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    this.customerSearch = `${customer.firstName} ${customer.lastName}`;
    this.filteredCustomers = [];
  }

  /**
   * Sends the extended property expose manually to the selected customer via email.
   *
   * This method builds the appropriate expose payload based on the selected customer
   * and the current property, then sends it to the backend email endpoint.
   *
   * It also updates the associated property inquiry process in Firestore,
   * including status, timestamps, and logging entries.
   *
   * @returns A Promise that resolves once the expose has been sent and the process updated.
   */
  async sendExposeToCustomer(): Promise<void> {
    if (!this.selectedCustomer || !this.immobilie) {
      alert('Bitte einen Kunden und eine Immobilie auswählen.');
      return;
    }

    const anfrageMock = this.mapCustomerToExposeAnfrageDto(
      this.selectedCustomer,
      this.immobilie.externalId!
    );
    const mailPayload = createExposeAnswerMailPayload(
      anfrageMock,
      this.immobilie
    );

    try {
      await this.http
        .post(
          'https://hilgert-immobilien.de/sendExposeAntwortMail.php',
          mailPayload
        )
        .toPromise();

      alert(`Exposé wurde an ${this.selectedCustomer.firstName} gesendet ✅`);

      const processId = `${this.selectedCustomer.customerId}_${this.immobilie.externalId}`;
      const processRef = doc(
        this.firestore,
        'property-inquiry-processes',
        processId
      );
      const processSnap = await getDoc(processRef);

      if (processSnap.exists()) {
        const process = processSnap.data() as PropertyInquiryProcess;

        process.exposeSent = new Date();
        process.inquiryProcessStatus = 'Exposé';
        process.lastUpdateDate = new Date();

        addLogEntryToProcess(
          process,
          createLogEntry(
            'Exposé manuell versendet',
            `${this.selectedCustomer.firstName} ${this.selectedCustomer.lastName}`,
            `Exposé wurde manuell an ${this.selectedCustomer.email} versendet.`
          )
        );

        addLogEntryToProcess(
          process,
          createLogEntry(
            'Status geändert',
            `${this.selectedCustomer.firstName} ${this.selectedCustomer.lastName}`,
            'Status nach Exposé-Versand automatisch zu "Exposé" geändert.'
          )
        );

        await setDoc(processRef, process, { merge: true });
      }
    } catch (error) {
      console.error('Fehler beim Mailversand:', error);
      alert('Fehler beim Versand des Exposés ❌');
    }
  }

  /**
   * Maps a customer and property ID to a valid ExposeAnfrageDto object,
   * which is used to trigger email payload creation.
   *
   * This method ensures all required fields of the DTO are populated,
   * including default values for optional fields if necessary.
   *
   * @param customer The customer to whom the expose will be sent.
   * @param propertyId The external ID of the property the expose refers to.
   * @returns A fully populated ExposeAnfrageDto object.
   */
  private mapCustomerToExposeAnfrageDto(
    customer: Customer,
    propertyId: string
  ): ExposeAnfrageDto {
    return {
      requestCustomerId: customer.customerId,
      salutation: customer.salutation,
      company: customer.company || '',

      firstName: customer.firstName,
      lastName: customer.lastName,
      street: customer.street || '',
      houseNumber: customer.houseNumber || '',
      zip: customer.zip || '',
      city: customer.city || '',

      email: customer.email,
      phone: customer.phone || '',

      message: 'Exposé-Versand durch manuelle Auswahl im Backend',

      acceptedTerms: true,
      acceptedWithdrawal: true,
      acceptedPrivacy: true,

      requestPropertyId: propertyId,
      creationDate: new Date().toISOString(),
    };
  }

  // private mapMarketingType(code: string): string {
  //   switch (code.toUpperCase()) {
  //     case 'PURCHASE':
  //       return 'Kauf';
  //     case 'RENT':
  //       return 'Miete';
  //     case 'LEASEHOLD':
  //       return 'Erbpacht';
  //     default:
  //       return 'Unbekannt';
  //   }
  // }

  /**
   * Toggles the auto-send option on the current property.
   * Called when the auto-send checkbox is changed.
   */
  async toggleAutoExposeSend(): Promise<void> {
    if (!this.immobilie?.externalId) return;

    const result = await this.immobilienService.updateProperty(
      this.immobilie.externalId,
      { autoExposeSend: this.immobilie.autoExposeSend }
    );

    // console.log('Speichere autoExposeSend:', this.immobilie.autoExposeSend);

    if (!result.success) {
      alert('Änderung konnte nicht gespeichert werden.');
    }
  }
}
