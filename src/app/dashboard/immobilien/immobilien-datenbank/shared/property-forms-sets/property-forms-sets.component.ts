import { Component, Input, OnInit } from '@angular/core';
import { ImmobilienService } from '../../../../../services/immobilien.service';
import { Immobilie } from '../../../../../models/immobilie.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { Customer } from '../../../../../models/customer.model';
import { CustomerService } from '../../../../../services/customer.service';
import { MATERIAL_MODULES } from '../../../../../shared/material-imports';
import { HttpClient } from '@angular/common/http';
import { PropertyInquiryService } from '../../../../../services/property-inquiry.service';
import { PropertyInquiryProcess, ViewingAppointment } from '../../../../../models/property-inquiry-process.model';

@Component({
  selector: 'app-property-forms-sets',
  standalone: true,
  imports: [CommonModule, RouterModule, MATERIAL_MODULES],
  templateUrl: './property-forms-sets.component.html',
  styleUrl: './property-forms-sets.component.scss'
})
export class PropertyFormsSetsComponent implements OnInit {
  @Input() immobilienId!: string;
  immobilie?: Immobilie;
  isAdmin = false;
  isLoading = true;
  allCustomers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  selectedCustomer?: Customer;
  customerSearch = '';
  objektnachweisStatus: 'checking' | 'exists' | 'missing' = 'checking';
  objektnachweisUrl: string = '';
  inquiryProcess: PropertyInquiryProcess | null = null;

  constructor(
    private immobilienService: ImmobilienService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private customerService: CustomerService,
    private propertyInquiryService: PropertyInquiryService,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.immobilienId = this.route.snapshot.paramMap.get('externalId') || '';
    await this.checkObjektnachweis(this.immobilienId);

    if (!this.immobilienId) return;

    this.authService.isAdmin().subscribe(async (isAdmin) => {
      this.isAdmin = isAdmin;
      if (!isAdmin) {
        console.warn('⛔ Zugriff verweigert – nur Admins dürfen Anfragen laden');
        return;
      }

      try {
        this.immobilie = await this.immobilienService.getImmobilieById(this.immobilienId);
        this.allCustomers = await this.customerService.getAllCustomers();
        this.isLoading = false;
      } catch (error) {
        console.error('❌ Fehler beim Laden der Daten:', error);
        this.isLoading = false;
      }
    });
  }

  filterCustomers(): void {
    const term = this.customerSearch.toLowerCase();
    const uniqueCustomers = new Map<string, Customer>();

    this.allCustomers.forEach(c => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      if (
        fullName.includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.customerId.toLowerCase().includes(term)
      ) {
        uniqueCustomers.set(c.customerId, c);
      }
    });

    this.filteredCustomers = Array.from(uniqueCustomers.values());
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    this.customerSearch = `${customer.firstName} ${customer.lastName}`;
    this.filteredCustomers = [];
  }

  async sendAppointmentConfirmationToCustomer(): Promise<void> {
    if (!this.immobilie || !this.selectedCustomer) {
      alert('Bitte einen Kunden und eine Immobilie auswählen.');
      return;
    }

    if (!this.immobilie?.externalId) {
      alert('Keine Immobilie vorhanden.');
      return;
    }    

    const process = await this.propertyInquiryService.getProcessByCustomerAndProperty(
      this.selectedCustomer.customerId,
      this.immobilie.externalId
    );

    if (!process) {
      alert('Kein passender Prozess gefunden.');
      return;
    }

    this.inquiryProcess = process;

      // 🟢 Hier wird der vorhandene Termin ausgelesen:
  const appointment = process.viewingAppointments?.find(
    v => v.viewingType === 'Erstbesichtigung' && v.viewingDate
  );

  if (!appointment?.viewingDate) {
    alert('Kein gültiger Besichtigungstermin gefunden.');
    return;
  }

  const date = new Date(appointment.viewingDate);

  const weekday = date.toLocaleDateString('de-DE', { weekday: 'long' });
  const day = date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const time = date.toTimeString().substring(0, 5);

  const checkResult = await this.immobilienService.checkObjektnachweisExists(this.immobilie.externalId);
  if (!checkResult.exists || !checkResult.url) {
    alert('Objektnachweis nicht gefunden. Bitte zuerst hochladen.');
    return;
  }

  const payload = {
    email: this.selectedCustomer.email,
    lastName: this.selectedCustomer.lastName,
    salutation: this.selectedCustomer.salutation,
    propertyExternalId: this.immobilie.externalId,
    propertyAddress: `${this.immobilie.street} ${this.immobilie.houseNumber}`,
    zip: this.immobilie.postcode,
    city: this.immobilie.city,
    date: day,
    weekday: weekday,
    time: time,
    formUrl: checkResult.url
  };

  try {
    await this.http
      .post('https://hilgert-immobilien.de/sendAppointmentConfirmation.php', payload)
      .toPromise();

    alert(`Terminbestätigung wurde an ${this.selectedCustomer.firstName} gesendet ✅`);
  } catch (error) {
    console.error('Fehler beim Senden der Terminbestätigung:', error);
    alert('Fehler beim Senden der E-Mail ❌');
  }
}

  addViewingAppointment(processId: string, newAppointment: ViewingAppointment) {
    const currentAppointments = this.inquiryProcess?.viewingAppointments || [];
    const updated = [...currentAppointments, newAppointment];
    this.propertyInquiryService.updateProcess(processId, { viewingAppointments: updated });
  }

  async checkObjektnachweis(externalId: string): Promise<void> {
    try {
      this.objektnachweisStatus = 'checking';
      const result = await this.immobilienService.checkObjektnachweisExists(externalId);
      this.objektnachweisStatus = result.exists ? 'exists' : 'missing';
      this.objektnachweisUrl = result.url || '';
    } catch (error) {
      console.error('Fehler bei Objektnachweis-Prüfung:', error);
      this.objektnachweisStatus = 'missing';
    }
  }

  async onObjektnachweisSelected(event: any): Promise<void> {
    const file: File = event.target.files?.[0];
    if (!file || !file.name.endsWith('.pdf')) {
      alert('Bitte eine PDF-Datei hochladen');
      return;
    }

    if (!this.immobilie?.externalId) {
      alert('Keine Immobilie vorhanden.');
      return;
    }

    try {
      const uploadResult = await this.immobilienService.uploadObjektnachweis(file, this.immobilie.externalId);

      if (uploadResult.success) {
        await this.delay(1000);
        await this.checkObjektnachweis(this.immobilie.externalId);
        alert('Objektnachweis erfolgreich hochgeladen ✅');
      } else {
        alert(uploadResult.error || 'Fehler beim Hochladen ❌');
      }
    } catch (error) {
      console.error('Fehler beim Hochladen:', error);
      alert('Fehler beim Hochladen ❌');
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
