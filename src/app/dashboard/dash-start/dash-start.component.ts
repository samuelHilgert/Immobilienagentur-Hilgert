import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { ViewingConfirmation } from '../../models/viewing-confirmation.model';
import { ViewingConfirmationService } from '../../services/viewing-confirmation.service';
import { Observable } from 'rxjs';
import { ImmobilienService } from '../../services/immobilien.service';
import { PropertyInquiryService } from '../../services/property-inquiry.service';
import { PropertyInquiryProcess } from '../../models/property-inquiry-process.model';

@Component({
  selector: 'app-dash-start',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, RouterModule],
  templateUrl: './dash-start.component.html',
  styleUrl: './dash-start.component.scss',
})
export class DashStartComponent {
  pendingVCs$!: Observable<ViewingConfirmation[]>;
  anfragen: PropertyInquiryProcess[] = [];
  trackByVcId = (_: number, vc: ViewingConfirmation) => vc.viewingConfirmationId;

  constructor(
    private vcService: ViewingConfirmationService,
    private router: Router,
    private immoSvc: ImmobilienService,
    private inquirySvc: PropertyInquiryService
  ) {}

  async ngOnInit() {
    this.pendingVCs$ = this.vcService.pending();

    await this.loadAnfragenZuAngeboten();
  }

  // robust: Firestore Timestamp | Date | string -> Date | null
  toDateSafe(v: any): Date | null {
    if (!v) return null;
    if (typeof v === 'object' && 'toDate' in v) {
      try {
        return v.toDate();
      } catch {
        return null;
      }
    }
    const d = new Date(v);
    return isNaN(+d) ? null : d;
  }

  openProcess(vc: ViewingConfirmation) {
    // Direkt zur Prozessseite navigieren
    this.router.navigate(
      [
        '/dashboard/protocol-inquiry-property',
        vc.customerId,
        vc.propertyExternalId,
      ],
      { queryParams: { from: 'kunden', externalId: vc.propertyExternalId } }
    );
  }

  async loadAnfragenZuAngeboten() {
    const offerExternalIds = await this.immoSvc.listExternalIdsWithStatusAngebot();
    this.anfragen = await this.inquirySvc.findProcessesForPropertyIdsWithStatusAnfrage(offerExternalIds);
  }

  openProcessForInquiry(proc: PropertyInquiryProcess) {
    this.router.navigate(
      [
        '/dashboard/protocol-inquiry-property',
        proc.customerId,
        proc.propertyExternalId,
      ],
      { queryParams: { from: 'kunden', externalId: proc.propertyExternalId } }
    );
  }


}
