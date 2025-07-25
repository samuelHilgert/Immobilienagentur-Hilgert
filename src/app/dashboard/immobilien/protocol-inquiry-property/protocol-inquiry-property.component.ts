import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PropertyInquiryService } from '../../../services/property-inquiry.service';
import { CustomerService } from '../../../services/customer.service';
import { ImmobilienService } from '../../../services/immobilien.service';
import { PropertyInquiryProcess } from '../../../models/property-inquiry-process.model';
import { Customer } from '../../../models/customer.model';
import { Immobilie } from '../../../models/immobilie.model';
import { MATERIAL_MODULES } from '../../../shared/material-imports';
import { convertTimestampsToDates } from '../../../utils/convert-timestamps.util';
import { ExposePreviewService } from '../../../services/expose-preview.service';
import { LogEntriesService } from '../../../services/logEntries.service';

@Component({
  selector: 'app-protocol-inquiry-property',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, RouterModule],
  templateUrl: './protocol-inquiry-property.component.html',
  styleUrl: './protocol-inquiry-property.component.scss',
})
export class ProtocolInquiryPropertyComponent implements OnInit {
  process: PropertyInquiryProcess | null = null;
  customer: Customer | null = null;
  immobilie: Immobilie | null = null;
  form!: FormGroup;
  loading = true;

  statuses = [
    'Ausgeschieden',
    'Anfrage',
    'Exposé',
    'Besichtigung',
    'Starkes Interesse',
    'Finanzierung',
    'Verhandlung',
    'Kaufvorbereitung',
    'Notarielle Abwicklung',
    'Übergabe',
    'Abgeschlossen',
  ];

  origin: 'kunden' | 'expose-anfragen' = 'kunden';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inquiryService: PropertyInquiryService,
    private customerService: CustomerService,
    private immobilienService: ImmobilienService,
    private exposePreviewService: ExposePreviewService,
    private fb: FormBuilder,
    private logEntriesService: LogEntriesService
  ) {}

  async ngOnInit() {
    const customerId = this.route.snapshot.paramMap.get('customerId');
    const propertyId = this.route.snapshot.paramMap.get('externalId');
    const from = this.route.snapshot.queryParamMap.get('from');

    if (
      from === 'expose-anfragen' ||
      from === 'kunden' ||
      from === 'kundendatenbank'
    ) {
      this.origin = from === 'kundendatenbank' ? 'kunden' : from;
    }

    if (!customerId || !propertyId) {
      this.loading = false;
      return;
    }

    this.process = await this.inquiryService.getProcessByCustomerAndProperty(
      customerId,
      propertyId
    );

    if (this.process) {
      this.process = convertTimestampsToDates(this.process);
      this.customer = await this.customerService.getCustomer(customerId);
      this.immobilie = await this.immobilienService.getProperty(propertyId);

      if (this.process) {
        const p = this.process;

        this.form = this.fb.group({
          inquiryProcessStatus: [p.inquiryProcessStatus],
          rejectionReasons: [p.rejectionReasons],
          exposeAccessLevel: [p.exposeAccessLevel],
          objectProof: [p.objectProof],
          giveDocuments: [p.giveDocuments],
          kindOfFinance: [p.kindOfFinance],
          CooperationWithFSK: [p.CooperationWithFSK],
          fundedSum: [p.fundedSum],
          bankConfirmation: [p.bankConfirmation],
          selfDisclosure: [p.selfDisclosure],
          schufaScore: [p.schufaScore],
          copyOfIDCardReceived: [p.copyOfIDCardReceived],
          notaryAppointmentDate: [p.notaryAppointmentDate],
          handoverType: [p.handoverType],
          handoverDate: [p.handoverDate],
          confirmationFinalPriceByOwner: [p.confirmationFinalPriceByOwner],

          viewingAppointments: this.fb.array(
            (p.viewingAppointments || []).map((a) =>
              this.fb.group({
                viewingType: [a.viewingType],
                viewingDate: [a.viewingDate],
                confirmationSent: [a.confirmationSent],
                confirmed: [a.confirmed],
                canceled: [a.canceled],
                cancellationReason: [a.cancellationReason],
                notes: [a.notes],
              })
            )
          ),

          purchaseOffers: this.fb.array(
            (p.purchaseOffers || []).map((o) =>
              this.fb.group({
                offerDate: [o.offerDate],
                offerMedium: [o.offerMedium],
                offerSum: [o.offerSum, Validators.required],
                offerText: [o.offerText],
                canceled: [o.canceled],
                cancellationReason: [o.cancellationReason],
                confirmed: [o.confirmed],
                forwarded: [o.forwarded],
                accepted: [o.accepted],
              })
            )
          ),
        });
      }
    }

    this.loading = false;
  }

  ////////////////// add purchase offer ////////////////////////
  get purchaseOffers() {
    return this.form.get('purchaseOffers') as FormArray;
  }

  addPurchaseOffer() {
    const offerGroup = this.fb.group({
      offerDate: [new Date()],
      offerMedium: ['mail'],
      offerSum: [null, Validators.required],
      offerText: [''],
      canceled: [false],
      cancellationReason: [''],
      confirmed: [false],
      forwarded: [null],
      accepted: [false],
    });
  
    this.purchaseOffers.push(offerGroup);
  }  

  async savePurchaseOffer(index: number) {
    if (!this.process) return;
  
    const offer = this.purchaseOffers.at(index).value;
  
    if (!this.process.purchaseOffers) {
      this.process.purchaseOffers = [];
    }
  
    this.process.purchaseOffers[index] = offer;
    this.process.lastUpdateDate = new Date();
  
    await this.inquiryService.updateProcess(this.process.inquiryProcessId, {
      purchaseOffers: this.process.purchaseOffers,
      lastUpdateDate: this.process.lastUpdateDate,
    });
  
    await this.logEntriesService.logProcessEntry(
      this.process.inquiryProcessId,
      `${this.customer?.firstName ?? ''} ${this.customer?.lastName ?? ''}`.trim(),
      'Kaufangebot gespeichert',
      `Summe: ${offer.offerSum} €`
    );
  }
  
  /////////////////////////////////////////

  ////////////////// Für die Besichtigungstermine ////////////////////////
  get viewingAppointments() {
    return this.form.get('viewingAppointments') as FormArray;
  }

  addAppointment() {
    const appointmentGroup = this.fb.group({
      viewingType: ['Erstbesichtigung'],
      viewingDate: [null],
      confirmationSent: [null],
      confirmed: [false],
      canceled: [false],
      cancellationReason: [''],
      notes: [''],
    });

    this.viewingAppointments.push(appointmentGroup);

    const index = this.viewingAppointments.length - 1;
    const selectedType = appointmentGroup.get('viewingType')?.value;
  }

  deleteAppointment(index: number) {
    this.viewingAppointments.removeAt(index);
  }

  async saveSingleAppointment(index: number) {
    if (!this.process || !this.immobilie) return;

    const appointment = this.viewingAppointments.at(index).value;

    // Sicherstellen, dass viewingAppointments existiert
    if (!this.process.viewingAppointments) {
      this.process.viewingAppointments = [];
    }

    // Termin an richtiger Stelle ersetzen oder anhängen
    this.process.viewingAppointments[index] = appointment;

    // Zeitstempel für letzte Änderung
    this.process.lastUpdateDate = new Date();

    // 🔁 Firestore-Update
    await this.inquiryService.updateProcess(this.process.inquiryProcessId, {
      viewingAppointments: this.process.viewingAppointments,
      lastUpdateDate: this.process.lastUpdateDate,
    });

    // Log-Eintrag
    await this.logEntriesService.logProcessEntry(
      this.process.inquiryProcessId,
      `${this.customer?.firstName ?? ''} ${
        this.customer?.lastName ?? ''
      }`.trim(),
      'Besichtigungstermin gespeichert',
      `Typ: ${appointment.viewingType}, Zeit: ${appointment.viewingDate}`
    );
  }

  ////////////////////////////////////////////////////////////////////////////////

  async save() {
    if (!this.process || !this.form.valid || !this.immobilie) return;

    const updatedFields = this.form.value;
    const processId = this.process.inquiryProcessId;
    const user = `${this.customer?.firstName ?? ''} ${
      this.customer?.lastName ?? ''
    }`.trim();

    // 🔁 Änderungszeitpunkt
    updatedFields.lastUpdateDate = new Date();

    // 📌 Statusänderung loggen
    const oldStatus = this.process.inquiryProcessStatus;
    const newStatus = updatedFields.inquiryProcessStatus;

    if (oldStatus !== newStatus) {
      await this.logEntriesService.logProcessEntry(
        processId,
        user,
        'Status geändert',
        `von "${oldStatus}" auf "${newStatus}"`
      );

      // 🧠 jetzt erst den neuen Wert setzen
      this.process.inquiryProcessStatus = newStatus;
    }

    // 👇 Immer setzen – auch wenn gleich
    updatedFields.inquiryProcessStatus = this.process.inquiryProcessStatus;

    // 📄 Exposé-Level geändert
    const oldLevel = this.process.exposeAccessLevel;
    const newLevel = updatedFields.exposeAccessLevel;

    if (oldLevel !== newLevel) {
      await this.exposePreviewService.addInquiryAccess(
        this.immobilie.externalId!,
        processId,
        newLevel
      );

      await this.logEntriesService.logProcessEntry(
        processId,
        user,
        'Exposé-Level geändert',
        `von "${oldLevel}" auf "${newLevel}"`
      );

      this.process.exposeAccessLevel = newLevel;
      updatedFields.exposeAccessLevel = newLevel;
    }

    updatedFields.purchaseOffers = this.purchaseOffers.value;
    updatedFields.viewingAppointments = this.viewingAppointments.value;

    // 🔁 History mitgeben
    updatedFields.historyLog = this.process.historyLog;
    updatedFields.exposeAccessLevel = this.process.exposeAccessLevel;


    // ✅ Gesamtspeicherung
    await this.inquiryService.updateProcess(processId, updatedFields);

    await this.logEntriesService.logProcessEntry(
      processId,
      user,
      'Änderungen gespeichert',
      'Allgemeine Änderungen wurden aktualisiert.'
    );

    alert('Änderungen gespeichert.');
  }

  // back button
  navigateToProtocol(externalId: string) {
    this.router.navigate(
      [
        '/dashboard/protocol-inquiry-property',
        this.customer?.customerId,
        externalId,
      ],
      {
        queryParams: {
          from: this.origin, // 👈 wichtig! falls du aus expose-anfragen kamst
          externalId: externalId,
        },
      }
    );
  }

  goBack() {
    if (this.origin === 'expose-anfragen' && this.customer && this.immobilie) {
      this.router.navigate(
        ['/dashboard/kunde-details', this.customer.customerId],
        {
          queryParams: {
            from: 'expose-anfragen', // ⬅️ notwendig, damit dort auch die Rücknavigation stimmt
            externalId: this.immobilie.externalId,
          },
        }
      );
    } else {
      this.router.navigate(['/dashboard/kundendatenbank']);
    }
  }
}
