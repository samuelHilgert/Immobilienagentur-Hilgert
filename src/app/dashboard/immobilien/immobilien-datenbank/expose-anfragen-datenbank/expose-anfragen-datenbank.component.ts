import { Component, Input, OnInit } from '@angular/core';
import { MATERIAL_MODULES } from '../../../../shared/material-imports';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ImmobilienService } from '../../../../services/immobilien.service';
import { Immobilie } from '../../../../models/immobilie.model';
import { AuthService } from '../../../../services/auth.service';
import { CustomerService } from '../../../../services/customer.service';
import { Customer, CustomerRole } from '../../../../models/customer.model';
import { CommonModule } from '@angular/common';
import {
  InquiryProcessStatus,
  PropertyInquiryProcess,
} from '../../../../models/property-inquiry-process.model';
import { PropertyInquiryService } from '../../../../services/property-inquiry.service';
import { ExposePreviewService } from '../../../../services/expose-preview.service';
import { ViewingConfirmationService } from '../../../../services/viewing-confirmation.service';

@Component({
  selector: 'app-expose-anfragen-datenbank',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, RouterModule],
  templateUrl: './expose-anfragen-datenbank.component.html',
  styleUrl: './expose-anfragen-datenbank.component.scss',
})
export class ExposeAnfragenDatenbankComponent implements OnInit {
  @Input() immobilienId!: string;
  customer: Customer[] = [];
  processes: PropertyInquiryProcess[] = [];
  immobilie?: Immobilie;
  isAdmin = false;
  isLoading = true;
  statuses: InquiryProcessStatus[] = [
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
  exposeLevels: Array<PropertyInquiryProcess['exposeAccessLevel']> = [
    'normal',
    'gekürzt',
    'erweitert',
  ];

  constructor(
    private immobilienService: ImmobilienService,
    private customerService: CustomerService,
    private propertyInquiryService: PropertyInquiryService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private exposePreviewService: ExposePreviewService,
    private viewingConfirmationService: ViewingConfirmationService
  ) {}

  async ngOnInit() {
    this.immobilienId = this.route.snapshot.paramMap.get('externalId') || '';
    if (!this.immobilienId) return;

    this.authService.isAdmin().subscribe(async (isAdmin) => {
      this.isAdmin = isAdmin;
      if (!isAdmin) {
        console.warn(
          '⛔ Zugriff verweigert – nur Admins dürfen Anfragen laden'
        );
        return;
      }

      try {
        // 🔍 Kunden mit Rolle "Interessent" und Anfrage zur Immobilie
        const allCustomers = await this.customerService.getAllCustomers();

        const interessenten = allCustomers.filter(
          (c) =>
            c.roles?.includes(CustomerRole.Interessent) &&
            c.buyerData?.angefragteImmobilienIds?.includes(this.immobilienId)
        );

        // 🔢 Sortieren nach Erstellungsdatum (neueste zuerst)
        this.customer = interessenten.sort(
          (a, b) =>
            new Date(b.creationDate || '').getTime() -
            new Date(a.creationDate || '').getTime()
        );

        // Prozess laden
        const processesRaw = await Promise.all(
          this.customer.map((c) =>
            this.propertyInquiryService.getProcessByCustomerAndProperty(
              c.customerId,
              this.immobilienId
            )
          )
        );

        // Nur gültige Prozesse übernehmen (null entfernen)
        this.processes = processesRaw.filter(
          (p): p is PropertyInquiryProcess => p !== null
        );

        // 🏠 Immobilie laden
        this.immobilie = await this.immobilienService.getImmobilieById(
          this.immobilienId
        );

        console.log('propertyType', this.immobilie.propertyType);
        this.isLoading = false;
      } catch (error) {
        console.error('❌ Fehler beim Laden der Daten:', error);
        this.isLoading = false;
      }
    });
  }

  getStatusForCustomer(customerId: string): InquiryProcessStatus | null {
    return (
      this.processes.find((p) => p.customerId === customerId)
        ?.inquiryProcessStatus ?? null
    );
  }

  goToCustomerDetails(customerId: string) {
    this.router.navigate(['/dashboard/kunde-details', customerId], {
      queryParams: {
        from: 'expose-anfragen',
        externalId: this.immobilienId,
      },
    });
  }

  // Saving-Status pro Prozess (key = inquiryProcessId)
  private savingMap: Record<string, boolean> = {};
  isSaving(processId?: string) {
    return processId ? !!this.savingMap[processId] : false;
  }

  getProcessForCustomer(
    customerId: string
  ): PropertyInquiryProcess | undefined {
    return this.processes.find((p) => p.customerId === customerId);
  }

  getProcessIdForCustomer(customerId: string): string | undefined {
    return this.getProcessForCustomer(customerId)?.inquiryProcessId;
  }

  getExposeLevelForCustomer(
    customerId: string
  ): PropertyInquiryProcess['exposeAccessLevel'] | null {
    return this.getProcessForCustomer(customerId)?.exposeAccessLevel ?? null;
  }

  // Status speichern
  async onChangeStatus(customerId: string, newStatus: InquiryProcessStatus) {
    const proc = this.getProcessForCustomer(customerId);
    if (!proc || !this.isAdmin) return;
  
    const processId = proc.inquiryProcessId;
    const old = proc.inquiryProcessStatus;
    if (old === newStatus) return;
  
    // Optimistisches Update
    proc.inquiryProcessStatus = newStatus;
    this.savingMap[processId] = true;
  
    try {
      await this.propertyInquiryService.updateProcess(processId, {
        inquiryProcessStatus: newStatus,
        lastUpdateDate: new Date(),
      });
  
      const shouldBlock = newStatus === 'Ausgeschieden';
  
      // 👇 1) Viewing-Confirmations blocken/entsperren
      await this.viewingConfirmationService.setBlockedForProcess(
        processId,
        shouldBlock
      );
  
      // 👇 2) Expose-Preview blocken/entsperren
      await this.exposePreviewService.setExposePreview(processId, {
        blocked: shouldBlock,
      });
  
    } catch (e) {
      proc.inquiryProcessStatus = old; // Revert
      console.error('Fehler beim Speichern des Status/Blockierens:', e);
    } finally {
      this.savingMap[processId] = false;
    }
  }

  // Exposé-Level speichern
  async onChangeExposeLevel(
    customerId: string,
    newLevel: 'normal' | 'gekürzt' | 'erweitert'
  ) {
    const proc = this.getProcessForCustomer(customerId);
    if (!proc || !this.isAdmin) return;

    const processId = proc.inquiryProcessId;
    const old = proc.exposeAccessLevel;
    if (old === newLevel) return;

    // Optimistisches Update in der UI
    proc.exposeAccessLevel = newLevel;
    this.savingMap[processId] = true;

    try {
      // 👇 Hier beide Collections gleichzeitig aktualisieren
      await Promise.all([
        this.propertyInquiryService.updateProcess(processId, {
          exposeAccessLevel: newLevel,
          lastUpdateDate: new Date(),
        }),
        // merge=true, falls das Preview-Dokument noch nicht existiert
        this.exposePreviewService.setExposePreview(processId, {
          exposeAccessLevel: newLevel,
        }),
      ]);
    } catch (e) {
      // Revert bei Fehler
      proc.exposeAccessLevel = old;
      console.error('Fehler beim Speichern des Exposé-Levels:', e);
    } finally {
      this.savingMap[processId] = false;
    }
  }
}
