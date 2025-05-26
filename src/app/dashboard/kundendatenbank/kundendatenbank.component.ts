import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-kundendatenbank',
  standalone: true,
  imports: [CommonModule, RouterModule, MATERIAL_MODULES, MatTableModule],
  templateUrl: './kundendatenbank.component.html',
  styleUrl: './kundendatenbank.component.scss',
})
export class KundendatenbankComponent implements OnInit {
  customers: Customer[] = [];
  dataSource = new MatTableDataSource<Customer>([]); // searchfield
  displayedColumns: string[] = [
    'customerId',
    'firstName',
    'lastName',
    'email',
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

    this.dataSource.data = this.customers;
    this.isLoading = false;
  }

  goToCustomerDetails(customerId: string) {
    this.router.navigate(['/dashboard/kunde-details', customerId], {
      queryParams: {
        from: 'kundendatenbank',
      },
    });    
  }

  addCustomer() {
    this.router.navigate(['/dashboard/kunde-anlegen']);
  }

  // searchfield 
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
  
    this.dataSource.filterPredicate = (data: Customer, filter: string): boolean => {
      return (
        data.customerId?.toLowerCase().includes(filter) ||
        data.firstName?.toLowerCase().includes(filter) ||
        data.lastName?.toLowerCase().includes(filter) ||
        data.email?.toLowerCase().includes(filter) ||
        data.mobile?.toLowerCase().includes(filter) ||
        data.roles?.some(role => role.toLowerCase().includes(filter))
      );
    };
  
    this.dataSource.filter = filterValue;
  }
  
}
