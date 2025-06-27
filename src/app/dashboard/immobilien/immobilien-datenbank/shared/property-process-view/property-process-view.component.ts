import { Component, Input, OnInit } from '@angular/core';
import { ImmobilienService } from '../../../../../services/immobilien.service';
import { Immobilie } from '../../../../../models/immobilie.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { PropertyInquiryProcess } from '../../../../../models/property-inquiry-process.model';
import { PropertyInquiryService } from '../../../../../services/property-inquiry.service';
import { CustomerService } from '../../../../../services/customer.service';
import { Customer, CustomerRole } from '../../../../../models/customer.model';
import { MATERIAL_MODULES } from '../../../../../shared/material-imports';

@Component({
  selector: 'app-property-process-view',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES, RouterModule],
  templateUrl: './property-process-view.component.html',
  styleUrl: './property-process-view.component.scss',
})

export class PropertyProcessViewComponent implements OnInit {
  @Input() immobilienId!: string;
  immobilie?: Immobilie;
  isAdmin = false;
  isLoading = true;
  propertyProcesses: PropertyInquiryProcess[] = [];
  customer: Customer | null = null;
  customers: Customer[] = [];

  constructor(
    private immobilienService: ImmobilienService,
    private propertyInquiryService: PropertyInquiryService,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
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

        // 🏠 Immobilie laden
        this.immobilie = await this.immobilienService.getImmobilieById(
          this.immobilienId
        );

        const allCustomers = await this.customerService.getAllCustomers();
        this.customers = allCustomers;
        
        const interessenten = allCustomers.filter(
          (c) =>
            c.roles?.includes(CustomerRole.Interessent) &&
            c.buyerData?.angefragteImmobilienIds?.includes(this.immobilienId)
        );
        
        const processesRaw = await Promise.all(
          interessenten.map((c) =>
            this.propertyInquiryService.getProcessByCustomerAndProperty(
              c.customerId,
              this.immobilienId
            )
          )
        );
        
        this.propertyProcesses = processesRaw.filter(
          (p): p is PropertyInquiryProcess => p !== null
        );
        
        console.log('propertyType', this.immobilie.propertyType);
        this.isLoading = false;
      } catch (error) {
        console.error('❌ Fehler beim Laden der Daten:', error);
        this.isLoading = false;
      }
    });
  }

  ////////////////// load purchase offers ////////////////////////
  get allPurchaseOffers(): {
    offerSum: number;
    offerDate: Date; // ⬅️ statt string
    customerName: string;
  }[] {
    return this.propertyProcesses.flatMap((process) => {
      const customer = this.customerForId(process.customerId);
      return (process.purchaseOffers || []).map((offer) => ({
        offerSum: offer.offerSum,
        offerDate: offer.offerDate, // ist Date
        customerName: customer
          ? `${customer.firstName} ${customer.lastName}`
          : 'Unbekannt',
      }));
    });
  }  
  ////////////////////////////////////////////////

  // Hilfsfunktion für Kunden
  private customerForId(customerId: string): Customer | undefined {
    return this.customers.find((c) => c.customerId === customerId);
  }  

  get totalInquiries(): number {
    return this.propertyProcesses.length;
  }
  
  get firstViewings(): number {
    return this.countViewings('Erstbesichtigung');
  }
  
  get secondViewings(): number {
    return this.countViewings('Zweitbesichtigung');
  }
  
  get thirdViewings(): number {
    return this.countViewings('Drittbesichtigung');
  }

  get strongInterest(): number {
    return this.propertyProcesses.filter(
      (p) => p.inquiryProcessStatus === 'Starkes Interesse'
    ).length;
  }  

  get customersWithStrongInterest(): string[] {
    return this.propertyProcesses
      .filter((p) => p.inquiryProcessStatus === 'Starkes Interesse')
      .map((p) => {
        const customer = this.customerForId(p.customerId);
        return customer ? `${customer.firstName} ${customer.lastName}` : 'Unbekannt';
      });
  }

  get totalRejections(): number {
    return this.propertyProcesses.filter(
      (p) => p.inquiryProcessStatus === 'Ausgeschieden'
    ).length;
  }

  get rejectionReasonsList(): string[] {
    return this.propertyProcesses
      .filter((p) => p.inquiryProcessStatus === 'Ausgeschieden' && p.rejectionReasons)
      .map((p) => p.rejectionReasons)
      .filter((reason) => reason.trim() !== '');
  }  
  
  get totalPurchaseOffers(): number {
    return this.propertyProcesses.reduce((sum, p) => sum + (p.purchaseOffers?.length || 0), 0);
  }
  
  get inFinancing(): number {
    return this.propertyProcesses.filter(
      (p) => p.inquiryProcessStatus === 'Finanzierung'
    ).length;
  }
  
  get inNegotiation(): number {
    return this.propertyProcesses.filter(
      (p) => p.inquiryProcessStatus === 'Verhandlung'
    ).length;
  }
  
  private countViewings(type: 'Erstbesichtigung' | 'Zweitbesichtigung' | 'Drittbesichtigung') {
    return this.propertyProcesses.reduce((sum, process) => {
      const viewings = process.viewingAppointments?.filter(v => v.viewingType === type && !v.canceled) || [];
      return sum + viewings.length;
    }, 0);
  }
  
}
