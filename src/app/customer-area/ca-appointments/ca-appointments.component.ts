import { Component, Inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { ActivatedRoute } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PropertyInquiryService } from '../../services/property-inquiry.service';
import {
  ViewingAppointment,
  PropertyInquiryProcess,
} from '../../models/property-inquiry-process.model';
import { ViewingConfirmationService } from '../../services/viewing-confirmation.service';

type UiAppointment = ViewingAppointment & {
  viewingDateObj?: Date;
  // ID der zugehörigen Bestätigungs-Doc (falls im Termin fehlt, berechnet)
  confirmationId?: string;
  // wurde vom Kunden bestätigt? (aus viewing-confirmations.acceptedConditions)
  confirmedByCustomer?: boolean;
};

@Component({
  selector: 'app-ca-appointments',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './ca-appointments.component.html',
  styleUrl: './ca-appointments.component.scss',
})
export class CaAppointmentsComponent implements OnInit {
  @Input() customerId?: string;
  @Input() propertyExternalId?: string;

  loading = true;
  error: string | null = null;

  upcoming: UiAppointment[] = [];
  past: UiAppointment[] = [];
  canceled: UiAppointment[] = [];

  // für buildId, wenn confirmationId fehlt
  private _customerId!: string;
  private _propertyExternalId!: string;

  constructor(
    private route: ActivatedRoute,
    private inquirySvc: PropertyInquiryService,
    private confirmSvc: ViewingConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    try {
      // 1) IDs ermitteln
      let customerId = this.customerId ?? this.data?.customerId;
      let propertyExternalId =
        this.propertyExternalId ?? this.data?.propertyExternalId;

      if (!customerId || !propertyExternalId) {
        const inquiryProcessId: string | null =
          this.route.snapshot.paramMap.get('inquiryProcessId');
        if (inquiryProcessId && inquiryProcessId.includes('_')) {
          const [cId, pId] = inquiryProcessId.split('_');
          customerId = customerId ?? cId;
          propertyExternalId = propertyExternalId ?? pId;
        }
      }

      if (!customerId || !propertyExternalId) {
        this.error = 'Keine gültige Anfrage-ID gefunden.';
        return;
      }

      this._customerId = customerId;
      this._propertyExternalId = propertyExternalId;

      // 2) Prozess laden
      const process: PropertyInquiryProcess | null =
        await this.inquirySvc.getProcessByCustomerAndProperty(
          customerId,
          propertyExternalId
        );

      if (!process) {
        this.error = 'Keine Termine gefunden.';
        return;
      }

      const all: UiAppointment[] = (process.viewingAppointments ?? [])
        .map((a) => this.enrich(a))
        .filter((a) => !!a.viewingDateObj);

      // 3) nach Zukunft/Vergangenheit/abgesagt gruppieren (ohne „offen“-Status)
      const now = new Date();
      const startToday = this.startOfDay(now);
      const upcoming: UiAppointment[] = [];
      const past: UiAppointment[] = [];
      const canceled: UiAppointment[] = [];

      for (const a of all) {
        if (a.canceled) {
          canceled.push(a);
        } else if (a.viewingDateObj! >= startToday) {
          upcoming.push(a);
        } else {
          past.push(a);
        }
      }

      // 4) Sortierung
      upcoming.sort((a, b) => +a.viewingDateObj! - +b.viewingDateObj!);
      past.sort((a, b) => +b.viewingDateObj! - +a.viewingDateObj!);
      canceled.sort((a, b) => +b.viewingDateObj! - +a.viewingDateObj!);

      // 5) Für alle zukünftigen Termine Bestätigungsstatus laden
      await this.hydrateConfirmations(upcoming);

      this.upcoming = upcoming;
      this.past = past;
      this.canceled = canceled;
    } catch (e) {
      console.error('[CaAppointments] load failed:', e);
      this.error = 'Termine konnten nicht geladen werden.';
    } finally {
      this.loading = false;
    }
  }

  /** erweitert Termin um Date-Objekt + (falls nötig) confirmationId */
  private enrich(a: ViewingAppointment): UiAppointment {
    const viewingDateObj = this.asDate(a.viewingDate) ?? undefined;
    let confirmationId = a.viewingConfirmationId;

    if (!confirmationId && viewingDateObj) {
      // gleiches Schema wie im ViewingConfirmationService
      confirmationId = `${this._customerId}_${
        this._propertyExternalId
      }_${viewingDateObj.getTime()}`;
    }
    return { ...a, viewingDateObj, confirmationId };
  }

  private async hydrateConfirmations(list: UiAppointment[]) {
    await Promise.all(
      list.map(async (a) => {
        if (!a.confirmationId) {
          a.confirmedByCustomer = false;
          return;
        }
        try {
          const vc = await this.confirmSvc.get(a.confirmationId);
          a.confirmedByCustomer = !!vc?.acceptedConditions;
        } catch {
          a.confirmedByCustomer = false;
        }
      })
    );
  }

  private asDate(val: any): Date | null {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (val?.toDate && typeof val.toDate === 'function') return val.toDate();
    const d = new Date(val);
    return isNaN(+d) ? null : d;
  }

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // Anzeige-Helfer
  fmtDate(d?: Date): string {
    if (!d) return '';
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }

  openConfirmation(a: UiAppointment) {
    if (!a.confirmationId) return;
    // neue Seite (oder nimm this.router.navigateByUrl(...), wenn im selben Tab)
    window.open(
      `/viewing-confirmation/${a.confirmationId}`,
      '_blank',
      'noopener'
    );
  }

  
}
