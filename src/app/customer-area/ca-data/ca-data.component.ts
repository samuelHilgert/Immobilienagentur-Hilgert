import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../../shared/material-imports';

@Component({
  selector: 'app-ca-data',
  standalone: true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './ca-data.component.html',
  styleUrl: './ca-data.component.scss',
})
export class CaDataComponent implements OnInit {
  @Input() customerData: any; 
  customerForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.customerForm = this.fb.group({
      customerId: [{ value: this.customerData.customerId, disabled: true }],
      salutation: [this.customerData.salutation],
      firstName: [this.customerData.firstName],
      lastName: [this.customerData.lastName],
      street: [this.customerData.street],
      houseNumber: [this.customerData.houseNumber],
      zip: [this.customerData.zip],
      city: [this.customerData.city],
      email: [this.customerData.email],
      phone: [this.customerData.phone],
      mobile: [this.customerData.mobile],
      birthday: [this.customerData.birthday],
      profession: [this.customerData.profession],
      roles: [this.customerData.roles || []],
      source: [this.customerData.source],
      otherDescription: [this.customerData.otherDescription],
      netIncome: [this.customerData.netIncome],
      equity: [this.customerData.equity],
      existingProperties: [this.customerData.existingProperties],
      stockAssets: [this.customerData.stockAssets],
      bankConfirmationAvailable: [this.customerData.bankConfirmationAvailable],
      bankConfirmationAmount: [this.customerData.bankConfirmationAmount],
      numberOfBuyers: [this.customerData.numberOfBuyers],
      numberOfOccupants: [this.customerData.numberOfOccupants],
      preferredLocations: [this.customerData.preferredLocations],
    });
  }

  sendChanges() {
    if (!this.customerForm) return;

    const changes = this.customerForm.getRawValue(); // alle Werte, inkl. disabled
    const emailBody = Object.entries(changes)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    // Hier per E-Mail senden (Backend-API oder Mailto)
    // Einfachstes Test-Beispiel mit mailto:
    const mailto = `mailto:admin@example.com?subject=Kundendaten-Änderung&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailto;
  }
}
