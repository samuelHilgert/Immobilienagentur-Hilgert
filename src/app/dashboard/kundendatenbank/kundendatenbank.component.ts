import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-kundendatenbank',
  standalone: true,
  imports: [CommonModule, RouterModule, MATERIAL_MODULES, MatTableModule],
  templateUrl: './kundendatenbank.component.html',
  styleUrl: './kundendatenbank.component.scss',
})
export class KundendatenbankComponent implements OnInit {
  customers: Customer[] = [];
  displayedColumns: string[] = [
    'customerId', 'firstName', 'lastName', 'email', 'phone', 'city', 'roles', 'creationDate'
  ];

  isLoading = true;
  selectedCustomer: Customer | null = null;
  
  constructor(private customerService: CustomerService, private router: Router) {}

  async ngOnInit() {
    const allCustomers = await this.customerService.getAllCustomers();
  
    this.customers = allCustomers.sort((a, b) => {
      const dateA = new Date(a.creationDate).getTime();
      const dateB = new Date(b.creationDate).getTime();
      return dateB - dateA;
    });
  
    this.isLoading = false;
  }
  
  goToDetails(id: string) {
    this.router.navigate([`/dashboard/kunde-details`, id]);
  }

  addCustomer() {
    this.router.navigate(['/dashboard/kunde-anlegen']);
  }
}
