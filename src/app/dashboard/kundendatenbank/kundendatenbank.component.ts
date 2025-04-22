import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
    'customerId',
    'firstName',
    'lastName',
    'email',
    'phone',
    'mobile',
    'city',
    'roles',
    'source',
    'creationDate',
  ];

  isLoading = true;
  selectedCustomer: Customer | null = null;
  externalId: string | null = null;

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.externalId = this.route.snapshot.paramMap.get('externalId');

    const allCustomers = await this.customerService.getAllCustomers();
    this.customers = allCustomers.sort((a, b) => {
      const dateA = new Date(a.creationDate).getTime();
      const dateB = new Date(b.creationDate).getTime();
      return dateB - dateA;
    });
    this.isLoading = false;
  }

  goToCustomerDetails(customerId: string) {
    this.router.navigate(['/dashboard/kunde-details', customerId], {
      queryParams: {
        from: 'expose-anfragen',
        externalId: this.externalId,
      },
    });
  }

  addCustomer() {
    this.router.navigate(['/dashboard/kunde-anlegen']);
  }
}
