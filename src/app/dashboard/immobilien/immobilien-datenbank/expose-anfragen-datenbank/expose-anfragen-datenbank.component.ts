import { Component, Input, OnInit } from '@angular/core';
import { MATERIAL_MODULES } from '../../../../shared/material-imports';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ImmobilienService } from '../../../../services/immobilien.service';
import { Immobilie } from '../../../../models/immobilie.model';
import { AuthService } from '../../../../services/auth.service';
import { CustomerService } from '../../../../services/customer.service';
import { Customer, CustomerRole } from '../../../../models/customer.model';
import { CommonModule } from '@angular/common';
import { PropertyInquiryProcess } from '../../../../models/property-inquiry-process.model';
import { PropertyInquiryService } from '../../../../services/property-inquiry.service';

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

  constructor(
    private immobilienService: ImmobilienService,
    private customerService: CustomerService,
    private propertyInquiryService: PropertyInquiryService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
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

  getStatusForCustomer(customerId: string): string {
    return (
      this.processes.find((p) => p.customerId === customerId)
        ?.inquiryProcessStatus || '—'
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
}
