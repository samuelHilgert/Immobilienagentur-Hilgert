import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CreationSource,
  Customer,
  CustomerRole,
} from '../../../models/customer.model';
import { MATERIAL_MODULES } from '../../../shared/material-imports';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../../services/customer.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImmobilienService } from '../../../services/immobilien.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { PropertyInquiryService } from '../../../services/property-inquiry.service';
import { PropertyInquiryProcess } from '../../../models/property-inquiry-process.model';
import { MediaAttachment } from '../../../models/media.model';
import { MediaService } from '../../../services/media.service';

interface CustomerExposeMailTracking {
  customerId: string;
  externalId: string;
  mailSentAt: string[];
}

@Component({
  selector: 'app-kunde-details',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, RouterModule],
  templateUrl: './kunde-details.component.html',
  styleUrl: './kunde-details.component.scss',
})
export class KundeDetailsComponent implements OnInit {
  origin: 'kunden' | 'expose-anfragen' = 'kunden';
  customerForm!: FormGroup;
  customerId: string = '';
  roles = Object.entries(CustomerRole).map(([key, label]) => ({ key, label }));
  externalId: string | null = null;
  preloadedMessage: string | null = null; // msg von expose anfrage
  selectedMailToSend: string | null = null;
  mailSelectionControl!: FormBuilder['control'];
  selectedImmobilienId: string | null = null;
  exposeMailHistory: string[] = [];
  allAvailableProperties: { id: string; adress: string }[] = [];
  inquiryProcess: PropertyInquiryProcess | null = null;
  angefragteImmobilien: any[] = [];
  mediaAttachments: { [key: string]: MediaAttachment[] } = {};
  isInteressentReady: boolean = false;
  titleImages: { [externalId: string]: MediaAttachment | null } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private propertyInquiryService: PropertyInquiryService,
    private fb: FormBuilder,
    private http: HttpClient,
    private immobilienService: ImmobilienService,
    private mediaService: MediaService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const from = params.get('from');
      const externalId = params.get('externalId');

      if (from === 'expose-anfragen' || from === 'kunden' || from === 'kundendatenbank') {
        this.origin = from === 'kundendatenbank' ? 'kunden' : from;
      }

      if (externalId) {
        this.externalId = externalId;
        this.selectedImmobilienId = this.externalId;
        // this.onImmobilienSelectionChange();
      }
    });



    // die mesg von der expose anfrage wird geholt
    this.route.queryParamMap.subscribe((params) => {
      const from = params.get('from');
      const externalId = params.get('externalId');
      const message = params.get('message'); // 👈

      if (from === 'expose-anfragen' || from === 'kunden') {
        this.origin = from as 'kunden' | 'expose-anfragen';
      }

      if (externalId) {
        this.externalId = externalId;
      }

      if (message) {
        this.preloadedMessage = message; // 👈 speichere message
      }
    });

    this.loadCustomer();
    this.loadAllProperties();
  }

  private async loadAllProperties() {
    const properties = await this.immobilienService.getProperties();
    this.allAvailableProperties = properties.map((p) => ({
      id: p.externalId,
      adress: `${p.street} – ${p.houseNumber} in ${p.city}`,
    }));
  }

  private async loadCustomer() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.customerId = id;
    const customer = await this.customerService.getCustomer(id);
    if (!customer) return;

    this.customerForm = this.fb.group({
      customerId: [{ value: customer.customerId, disabled: true }],
      salutation: [customer.salutation],
      firstName: [customer.firstName],
      lastName: [customer.lastName],
      street: [customer.street],
      houseNumber: [customer.houseNumber],
      zip: [customer.zip],
      city: [customer.city],
      email: [customer.email, Validators.email],
      phone: [customer.phone],
      mobile: [customer.mobile],
      birthday: [customer.birthday],
      profession: [customer.profession],
      roles: [customer.roles],
      postalCode: [''],
      source: [customer.source || ''],
    });

    await this.loadInquiryProperties(
      customer.buyerData?.angefragteImmobilienIds || []
    );

    // 🧠 Inquiry-Prozess nach Laden des Kunden holen
    if (this.externalId && this.customerId) {
      this.inquiryProcess =
        await this.propertyInquiryService.getProcessByCustomerAndProperty(
          this.customerId,
          this.externalId
        );
    }

    if (customer.roles.includes(CustomerRole.Interessent)) {
      const buyer = customer.buyerData || {};

      ////////////////////// Terminübersicht /////////////////////

      // this.customerForm.addControl(
      //   'firstViewingDate',
      //   this.fb.control(buyer.firstViewingDate || null)
      // );
      // this.customerForm.addControl(
      //   'secondViewingDate',
      //   this.fb.control(buyer.secondViewingDate || null)
      // );
      // this.customerForm.addControl(
      //   'notaryAppointmentDate',
      //   this.fb.control(buyer.notaryAppointmentDate || null)
      // );
      // this.customerForm.addControl(
      //   'handoverDate',
      //   this.fb.control(buyer.handoverDate || null)
      // );
      // this.customerForm.addControl(
      //   'finalPurchasePrice',
      //   this.fb.control(buyer.finalPurchasePrice || null)
      // );

      ///////////////////////////////////////////////////////////////
      this.customerForm.addControl(
        'angefragteImmobilienIds',
        this.fb.control(customer.buyerData?.angefragteImmobilienIds || [])
      );

      // this.customerForm.addControl(
      //   'requestMessage',
      //   this.fb.control(buyer.requestMessage || this.preloadedMessage || '')
      // );

      this.customerForm.addControl(
        'otherDescription',
        this.fb.control(buyer.otherDescription)
      );
      this.customerForm.addControl(
        'netIncome',
        this.fb.control(buyer.netIncome)
      );
      this.customerForm.addControl('equity', this.fb.control(buyer.equity));
      this.customerForm.addControl(
        'existingProperties',
        this.fb.control(buyer.existingProperties)
      );
      this.customerForm.addControl(
        'stockAssets',
        this.fb.control(buyer.stockAssets)
      );
      this.customerForm.addControl(
        'bankConfirmationAvailable',
        this.fb.control(buyer.bankConfirmation?.available || false)
      );
      this.customerForm.addControl(
        'bankConfirmationAmount',
        this.fb.control(buyer.bankConfirmation?.amount)
      );
      this.customerForm.addControl(
        'numberOfBuyers',
        this.fb.control(buyer.numberOfBuyers)
      );
      this.customerForm.addControl(
        'numberOfOccupants',
        this.fb.control(buyer.numberOfOccupants)
      );
      this.customerForm.addControl(
        'preferredLocations',
        this.fb.control(buyer.preferredLocations?.join(', '))
      );
      // this.customerForm.addControl(
      //   'processStatus',
      //   this.fb.control(buyer.processStatus)
      // );
    }

    this.isInteressentReady = true;
  }

  getMediaForImmobilie(externalId: string | undefined): MediaAttachment[] {
    if (!externalId) return [];
    return this.mediaAttachments[externalId] || [];
  }

  get isInteressent(): boolean {
    return this.customerForm
      ?.get('roles')
      ?.value?.includes(CustomerRole.Interessent);
  }

  async onSubmit() {
    if (this.customerForm.invalid) return;

    const rawValues = this.customerForm.getRawValue();

    const updatedCustomer: Partial<Customer> = {
      customerId: rawValues.customerId,
      salutation: rawValues.salutation,
      firstName: rawValues.firstName,
      lastName: rawValues.lastName,
      street: rawValues.street,
      houseNumber: rawValues.houseNumber,
      zip: rawValues.zip,
      city: rawValues.city,
      email: rawValues.email,
      phone: rawValues.phone,
      mobile: rawValues.mobile,
      birthday: rawValues.birthday,
      profession: rawValues.profession,
      roles: rawValues.roles,
      lastModificationDate: new Date().toISOString(),
      source: CreationSource.Sonstiges,
    };

    if (rawValues.roles.includes(CustomerRole.Interessent)) {
      const bankConfirmation: { available?: boolean; amount?: number } = {
        available: rawValues.bankConfirmationAvailable,
      };

      if (
        rawValues.bankConfirmationAvailable &&
        rawValues.bankConfirmationAmount !== null &&
        rawValues.bankConfirmationAmount !== undefined
      ) {
        bankConfirmation.amount = rawValues.bankConfirmationAmount;
      }

      const buyerData = {
        netIncome: rawValues.netIncome,
        equity: rawValues.equity,
        existingProperties: rawValues.existingProperties,
        stockAssets: rawValues.stockAssets,
        bankConfirmation,
        numberOfBuyers: rawValues.numberOfBuyers,
        numberOfOccupants: rawValues.numberOfOccupants,
        preferredLocations: rawValues.preferredLocations
          ? rawValues.preferredLocations.split(',').map((s: string) => s.trim())
          : [],
        processStatus: rawValues.processStatus,
        requestMessage: rawValues.requestMessage,
        otherDescription: rawValues.otherDescription,
        angefragteImmobilienIds: rawValues.angefragteImmobilienIds || [],
        finalPurchasePrice: rawValues.finalPurchasePrice || null,

        ////////////////////// Terminübersicht /////////////////////
        firstViewingDate: rawValues.firstViewingDate || null,
        secondViewingDate: rawValues.secondViewingDate || null,
        notaryAppointmentDate: rawValues.notaryAppointmentDate || null,
        handoverDate: rawValues.handoverDate || null,
      };

      updatedCustomer.buyerData = this.removeUndefined(buyerData);
    }

    const result = await this.customerService.updateCustomer(
      this.customerId,
      updatedCustomer
    );

    if (result.success) {
      alert('Kunde erfolgreich aktualisiert!');
      this.goBack(); // 🎯 zur Ursprungskomponente zurück
    } else {
      alert('Fehler beim Aktualisieren des Kunden');
      console.error(result.error);
    }
  }

  // async onImmobilienSelectionChange() {
  //   console.log('Lade Mailhistorie für:', this.selectedImmobilienId);
  // }

  // getExposeMailDatesForSelectedId(): string {
  //   const immoId = this.selectedImmobilienId;
  //   if (!immoId) return 'nicht versendet';

  //   const mailMap: Record<string, string[]> =
  //     this.customerForm.get('mailExposeSentAt')?.value || {};

  //   const entries = mailMap[immoId];

  //   if (!entries || entries.length === 0) {
  //     return 'nicht versendet';
  //   }

  //   return entries.map((d: string) => new Date(d).toLocaleString()).join(', ');
  // }

  // private mapMarketingType(code: string): string {
  //   switch (code.toUpperCase()) {
  //     case 'PURCHASE':
  //       return 'Kauf';
  //     case 'RENT':
  //       return 'Miete';
  //     case 'LEASEHOLD':
  //       return 'Erbpacht';
  //     default:
  //       return 'Kauf';
  //   }
  // }

  // formatMailDates(controlName: string): string {
  //   const val = this.customerForm.get(controlName)?.value;

  //   if (!val || (Array.isArray(val) && val.length === 0)) {
  //     return 'nicht versendet';
  //   }

  //   if (Array.isArray(val)) {
  //     return val.map((d: string) => new Date(d).toLocaleString()).join(', ');
  //   }

  //   return new Date(val).toLocaleString();
  // }

  // Button zum Löschen des Kudnen
  async onDelete(): Promise<void> {
    const confirmed = confirm(
      'Kunden wirklich löschen? Zugehörige Exposé-Zugänge (falls vorhanden) werden ebenfalls entfernt.'
    );
    if (!confirmed) return;
  
    const res = await this.customerService.deleteCustomerAndPreviews(this.customerId);
  
    if (res.success) {
      const info = res.deletedPreviews > 0
        ? `Gelöschte Exposé-Previews: ${res.deletedPreviews}`
        : 'Keine Exposé-Previews vorhanden (nichts zu löschen).';
      alert(`Kunde wurde gelöscht. ${info}`);
      this.goBack();
    } else {
      alert('Fehler beim Löschen des Kunden. Details in der Konsole.');
    }
  }

  private async loadInquiryProperties(ids: string[]) {
    if (!ids || ids.length === 0) return;

    const all = await this.immobilienService.getProperties();
    this.angefragteImmobilien = all.filter((p) => ids.includes(p.externalId));

    // Bilder laden
    const titleImagePromises = this.angefragteImmobilien.map(async (immo) => {
      const titleImage = await this.mediaService.getTitleImageForProperty(immo.externalId);
      console.log('Geladenes Titelbild für', immo.externalId, titleImage); // 👈 Debug
 
      this.titleImages[immo.externalId] = titleImage;
    });

    await Promise.all(titleImagePromises);
  }

  // 🔙 Zurück-Button-Verhalten basierend auf `origin`
  goBack() {
    if (this.origin === 'expose-anfragen' && this.externalId) {
      this.router.navigate(['/dashboard/expose-anfragen-datenbank', this.externalId]);
    } else {
      this.router.navigate(['/dashboard/kundendatenbank']);
    }
  }  

  // 🧹 Hilfsfunktion – entfernt undefined-Felder
  private removeUndefined(obj: any): any {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
  }

  navigateToProtocol(externalId: string) {
    this.router.navigate([
      '/dashboard/protocol-inquiry-property',
      this.customerId,
      externalId
    ], {
      queryParams: {
        from: this.origin, 
        externalId: externalId,
      },
    });
  }  
  
  async getTitleImageForImmobilie(externalId: string): Promise<MediaAttachment | null> {
    return await this.mediaService.getTitleImageForProperty(externalId);
  }
  
  
}

