import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { PropertyInquiryService } from '../../../services/property-inquiry.service';
import { CustomerService } from '../../../services/customer.service';
import { ImmobilienService } from '../../../services/immobilien.service';
import { PropertyInquiryProcess, ViewingAppointment } from '../../../models/property-inquiry-process.model';
import { Customer } from '../../../models/customer.model';
import { Immobilie } from '../../../models/immobilie.model';
import { MATERIAL_MODULES } from '../../../shared/material-imports';
import { convertTimestampsToDates } from '../../../utils/convert-timestamps.util';
import { ExposePreviewService } from '../../../services/expose-preview.service';
import { LogEntriesService } from '../../../services/logEntries.service';
import { ExposeAnfrageService } from '../../../services/expose-anfrage.service';
import { HttpClient } from '@angular/common/http';
import { ViewingConfirmationService } from '../../../services/viewing-confirmation.service';

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
  sending = false;
  sendingAppointment = false;

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
    private exposeAnfrageService: ExposeAnfrageService,
    private fb: FormBuilder,
    private logEntriesService: LogEntriesService,
    private viewingConfirmSvc: ViewingConfirmationService,
    private http: HttpClient
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
      `${this.customer?.firstName ?? ''} ${
        this.customer?.lastName ?? ''
      }`.trim(),
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
    // kein sofortiges Save hier – der Nutzer speichert i.d.R. explizit
  }

  async deleteAppointment(index: number) {
    if (!this.process || !this.customer || !this.immobilie) return;
  
    const removed: ViewingAppointment | undefined = this.viewingAppointments.at(index)?.value;
  
    // Optimistisch aus UI entfernen
    this.viewingAppointments.removeAt(index);
  
    // Prozess-Array + Zeitstempel
    const newList = this.viewingAppointments.value as ViewingAppointment[];
    this.process.viewingAppointments = newList;
    this.process.lastUpdateDate = new Date();
  
    try {
      await this.inquiryService.updateProcess(this.process.inquiryProcessId, {
        viewingAppointments: newList,
        lastUpdateDate: this.process.lastUpdateDate,
      });
  
      // VC-Datensatz löschen (falls vorhanden)
      if (removed) await this.viewingConfirmSvc.deleteForAppointment(removed);
  
      await this.logEntriesService.logProcessEntry(
        this.process.inquiryProcessId,
        `${this.customer.firstName ?? ''} ${this.customer.lastName ?? ''}`.trim(),
        'Besichtigungstermin gelöscht',
        removed ? `Typ: ${removed.viewingType || '-'}, Zeit: ${removed.viewingDate || '-'}` : `Index: ${index}`
      );
    } catch (e) {
      console.error('Löschen fehlgeschlagen, rolle lokal zurück:', e);
      // Rollback im UI (optional)
      this.viewingAppointments.insert(index, this.fb.group({
        viewingType: [removed?.viewingType ?? 'Erstbesichtigung'],
        viewingDate: [removed?.viewingDate ?? null],
        confirmationSent: [removed?.confirmationSent ?? null],
        confirmed: [removed?.confirmed ?? false],
        canceled: [removed?.canceled ?? false],
        cancellationReason: [removed?.cancellationReason ?? ''],
        notes: [removed?.notes ?? ''],
        viewingConfirmationId: [removed?.viewingConfirmationId ?? null],
      }));
      alert('Termin konnte nicht gelöscht werden.');
    }
  }
  

  async saveSingleAppointment(index: number) {
    if (!this.process || !this.immobilie || !this.customer) return;
  
    const appt: ViewingAppointment = this.viewingAppointments.at(index).value;
  
    // 1) Prozess aktualisieren (wie bisher)
    if (!this.process.viewingAppointments) this.process.viewingAppointments = [];
    this.process.viewingAppointments[index] = appt;
    this.process.lastUpdateDate = new Date();
  
    await this.inquiryService.updateProcess(this.process.inquiryProcessId, {
      viewingAppointments: this.process.viewingAppointments,
      lastUpdateDate: this.process.lastUpdateDate,
    });
  
    // 2) VC für diesen Termin upserten
    const vcId = await this.viewingConfirmSvc.upsertForAppointment(
      this.process, this.customer, this.immobilie, appt
    );
  
    // 3) VC-ID im Termin speichern (falls neu oder geändert)
    if (vcId && appt.viewingConfirmationId !== vcId) {
      appt.viewingConfirmationId = vcId;
      this.process.viewingAppointments[index] = appt;
      await this.inquiryService.updateProcess(this.process.inquiryProcessId, {
        viewingAppointments: this.process.viewingAppointments,
        lastUpdateDate: new Date(),
      });
    }
  
    await this.logEntriesService.logProcessEntry(
      this.process.inquiryProcessId,
      `${this.customer?.firstName ?? ''} ${this.customer?.lastName ?? ''}`.trim(),
      'Besichtigungstermin gespeichert',
      `Typ: ${appt.viewingType}, Zeit: ${appt.viewingDate}`
    );
  }
  
  ////////////////////////////////////////////////////////////////////////////////

  async save() {
    // Guard Clauses
    if (!this.process || !this.form?.valid || !this.customer || !this.immobilie)
      return;

    const processId = this.process.inquiryProcessId;
    const userLabel = `${this.customer.firstName ?? ''} ${
      this.customer.lastName ?? ''
    }`.trim();

    // Werte aus dem Formular
    const updatedFields = { ...this.form.value };

    // Timestamps / Pflichtfelder setzen
    updatedFields.lastUpdateDate = new Date();

    // -------------------------------
    // Statuswechsel behandeln (+ Preview sperren/entsperren)
    // -------------------------------
    const oldStatus = this.process.inquiryProcessStatus;
    const newStatus = updatedFields.inquiryProcessStatus;

    if (oldStatus !== newStatus) {
      // Preview blocken, wenn ausgeschieden
      try {
        await this.exposePreviewService.setExposePreview(processId, {
          blocked: newStatus === 'Ausgeschieden',
        });
      } catch (e) {
        console.warn('Konnte blocked-Flag nicht updaten:', e);
      }

      await this.logEntriesService.logProcessEntry(
        processId,
        userLabel,
        'Status geändert',
        `von "${oldStatus}" auf "${newStatus}"`
      );

      // lokalen Prozess updaten (damit sync die korrekten Daten sieht)
      this.process.inquiryProcessStatus = newStatus;
    }

    // Stelle sicher, dass das Feld gesetzt bleibt
    updatedFields.inquiryProcessStatus = this.process.inquiryProcessStatus;

    // -------------------------------
    // Exposé-Level Änderung behandeln
    // -------------------------------
    const oldLevel = this.process.exposeAccessLevel;
    const newLevel = updatedFields.exposeAccessLevel;

    if (oldLevel !== newLevel) {
      await this.exposePreviewService.updateAccessLevel(processId, newLevel);

      await this.logEntriesService.logProcessEntry(
        processId,
        userLabel,
        'Exposé-Level geändert',
        `von "${oldLevel}" auf "${newLevel}"`
      );

      this.process.exposeAccessLevel = newLevel;
      updatedFields.exposeAccessLevel = newLevel;
    }

    // -------------------------------
    // Form-Arrays zurück in den Prozess (damit Firestore & Sync konsistent sind)
    // -------------------------------
    updatedFields.purchaseOffers = this.purchaseOffers.value;
    updatedFields.viewingAppointments = this.viewingAppointments.value;

    // History und evtl. weitere Felder mitgeben
    updatedFields.historyLog = this.process.historyLog ?? [];
    updatedFields.exposeAccessLevel = this.process.exposeAccessLevel;

    // -------------------------------
    // Firestore-Update des Prozesses
    // -------------------------------
    await this.inquiryService.updateProcess(processId, updatedFields);

    // Lokales Modell sofort aktualisieren (wichtig für den nachfolgenden Sync)
    this.process = {
      ...this.process,
      ...updatedFields,
    };

    // Log
    await this.logEntriesService.logProcessEntry(
      processId,
      userLabel,
      'Änderungen gespeichert',
      'Allgemeine Änderungen wurden aktualisiert.'
    );

    alert('Änderungen gespeichert.');
  }

  async onSendExpose() {
    if (!this.process || !this.customer || !this.immobilie) return;
    try {
      this.sending = true;

      await this.exposeAnfrageService.sendExposeManual(
        this.process,
        this.customer,
        this.immobilie
      );

      // UI sofort aktualisieren
      this.process.exposeSent = new Date();
      this.process.inquiryProcessStatus = 'Exposé';

      // optional loggen
      await this.logEntriesService.logProcessEntry(
        this.process.inquiryProcessId,
        `${this.customer.firstName} ${this.customer.lastName}`.trim(),
        'Exposé per E-Mail versendet',
        `Objekt ${this.immobilie.externalId}`
      );

      alert('Exposé wurde versendet.');
    } catch (e: any) {
      console.error(e);
      alert('Exposé konnte nicht versendet werden: ' + (e?.message || e));
    } finally {
      this.sending = false;
    }
  }

  // Nimmt den spätesten zukünftigen Termin (weit in der Zukunft).
  // Optionaler Fallback: wenn kein zukünftiger, nimm den zuletzt vergangenen.
  private pickConfirmableAppointment(): { index: number; appt: any } | null {
    const arr = (this.viewingAppointments?.value ?? []) as any[];
    if (!arr.length) return null;

    const now = new Date();

    const withDate = arr
      .map((a, i) => ({
        i,
        a,
        d: a?.viewingDate ? new Date(a.viewingDate) : null,
      }))
      .filter((x) => !!x.d && !x.a?.canceled); // nur mit Datum & nicht abgesagt

    // ▶ zukünftige Termine
    const future = withDate.filter((x) => x.d! >= now);
    if (future.length) {
      // spätester zukünftiger Termin
      const pick = future.reduce((max, cur) => (cur.d! > max.d! ? cur : max));
      return { index: pick.i, appt: pick.a };
    }

    // (optional) ▶ falls keine Zukunft: letzter vergangener Termin
    const past = withDate.filter((x) => x.d! < now);
    if (past.length) {
      past.sort((a, b) => b.d!.getTime() - a.d!.getTime()); // jüngster vergangener zuerst
      return { index: past[0].i, appt: past[0].a };
    }

    return null;
  }

  get canSendAppointmentConfirmation(): boolean {
    if (this.sendingAppointment || !this.customer?.email || !this.immobilie)
      return false;
    if (this.form.get('inquiryProcessStatus')?.value === 'Ausgeschieden')
      return false;
    if (this.immobilie.propertyStatus === 'Referenz') return false;
    return !!this.pickConfirmableAppointment();
  }

  async onSendAppointmentConfirmation() {
    if (!this.process || !this.customer || !this.immobilie) return;
  
    const pick = this.pickConfirmableAppointment();
    if (!pick) {
      alert('Kein gültiger Besichtigungstermin vorhanden.');
      return;
    }
  
    const appt = pick.appt as ViewingAppointment;
  
    // 1) Sicherstellen, dass ein VC existiert und wir eine ID haben
    let vcId = appt.viewingConfirmationId ?? null;
    if (!vcId) {
      vcId = await this.viewingConfirmSvc.upsertForAppointment(
        this.process, this.customer, this.immobilie, appt
      );
      if (vcId) {
        appt.viewingConfirmationId = vcId;
        this.process.viewingAppointments![pick.index] = appt;
        await this.inquiryService.updateProcess(this.process.inquiryProcessId, {
          viewingAppointments: this.process.viewingAppointments,
          lastUpdateDate: new Date(),
        });
      }
    }
    if (!vcId) {
      alert('Konnte keine Bestätigungs-ID erzeugen.');
      return;
    }
  
    // 2) Maildaten vorbereiten
    const dt = new Date(appt.viewingDate!);
    const weekday = dt.toLocaleDateString('de-DE', { weekday: 'long' });
    const day = dt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = dt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  
    const street = this.immobilie.street ?? '';
    const houseNumber = this.immobilie.houseNumber ?? '';
    const postcode = this.immobilie.postcode ?? '';
    const city = this.immobilie.city ?? '';
    const externalId = this.immobilie.externalId ?? '';
  
    const baseUrl = location.origin;
    const confirmUrl = `${baseUrl}/viewing-confirmation/${vcId}`;
  
    const payload = {
      email: this.customer.email,
      lastName: this.customer.lastName,
      salutation: this.customer.salutation,
      propertyExternalId: externalId,
      propertyAddress: `${street} ${houseNumber}`,
      zip: postcode,
      city,
      date: day,
      weekday,
      time,
      confirmUrl,
    };
  
    try {
      this.sendingAppointment = true;
  
      // 3) Mail versenden
      await this.http
        .post('https://hilgert-immobilien.de/sendAppointmentConfirmation.php', payload)
        .toPromise();
  
      // 4) VC: Versandzeitpunkt speichern (NICHT creationDate)
      await this.viewingConfirmSvc.markMailSent(vcId, new Date());
  
      // 5) Optional: im Prozess den einzelnen Termin mit "confirmationSent" markieren
      appt.confirmationSent = new Date();
      this.process.viewingAppointments![pick.index] = appt;
      await this.inquiryService.updateProcess(this.process.inquiryProcessId, {
        viewingAppointments: this.process.viewingAppointments,
        lastUpdateDate: new Date(),
      });
  
      alert('Terminbestätigung wurde versendet.');
    } catch (e) {
      console.error('Fehler beim Senden der Terminbestätigung:', e);
      alert('Fehler beim Senden der E-Mail ❌');
    } finally {
      this.sendingAppointment = false;
    }
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
