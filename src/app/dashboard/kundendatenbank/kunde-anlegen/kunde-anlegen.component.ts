import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CreationSource, Customer, CustomerRole } from '../../../models/customer.model';
import { CustomerService } from '../../../services/customer.service';
import { MATERIAL_MODULES } from '../../../shared/material-imports';

@Component({
  selector: 'app-kunde-anlegen',
  standalone: true,
  imports: [RouterModule, MATERIAL_MODULES],
  templateUrl: './kunde-anlegen.component.html',
  styleUrl: './kunde-anlegen.component.scss'
})

export class KundeAnlegenComponent implements OnInit {
  customerForm!: FormGroup;
  roles = Object.values(CustomerRole);
  generatedId: string = ''; 
  isTenant: boolean = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.generatedId = await this.customerService.createEmptyCustomerId();
    const customer = this.initCustomer();
  
    this.customerForm = this.fb.group({
      customerId: [customer.customerId],
      salutation: [customer.salutation],
      firstName: [customer.firstName],
      lastName: [customer.lastName],
      street: [customer.street],
      houseNumber: [customer.houseNumber],
      postalCode: [customer.zip],
      city: [customer.city],
      email: [customer.email, Validators.email],
      phone: [customer.phone],
      mobile: [customer.mobile],
      roles: [customer.roles],
      profession: [customer.profession],
      birthday: [customer.birthday],
      homepage: [customer.homepage],
      source: [customer.source],
      tenantDescription: [''] // <-- neues Feld
    });
  
    // Dynamische Beobachtung
    this.customerForm.get('roles')?.valueChanges.subscribe((roles: CustomerRole[]) => {
      this.isTenant = roles.includes(CustomerRole.Mieter);
    });
  }

  private initCustomer(): Customer {
    const id = this.generatedId;
    return {
      customerId: id,
      salutation: '',
      firstName: '',
      lastName: '',
      street: '',
      houseNumber: '',
      zip: '',
      city: '',
      email: '',
      phone: '',
      mobile: '',
      roles: [],
      profession: '',
      birthday: '',
      homepage: '',
      source: CreationSource.Manuell,
      creationDate: '',
      lastModificationDate: '',
    };
  }

  async onSubmit() {
    if (this.customerForm.valid) {
      const formValue = this.customerForm.getRawValue();

      const indexId = await this.customerService.getNextCustomerIndexId();

      const customer: Customer = {
        ...formValue,
        customerId: this.generatedId,
        zip: formValue.postalCode,
        indexId,
        creationDate: new Date().toISOString(),
        lastModificationDate: new Date().toISOString(),
        tenantData: formValue.roles.includes(CustomerRole.Mieter)
          ? { otherDescription: formValue.tenantDescription }
          : undefined
      };
      

      const result = await this.customerService.saveCustomer(customer);

      if (result.success) {
        alert('Kunde erfolgreich gespeichert!');
        this.router.navigate(['/dashboard/kundendatenbank']);
      } else {
        console.error(result.error);
        alert('Fehler beim Speichern des Kunden.');
      }
    }
  }
}
