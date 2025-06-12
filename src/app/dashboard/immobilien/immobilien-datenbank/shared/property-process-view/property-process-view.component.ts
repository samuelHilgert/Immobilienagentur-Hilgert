import { Component, Input, OnInit } from '@angular/core';
import { ImmobilienService } from '../../../../../services/immobilien.service';
import { Immobilie } from '../../../../../models/immobilie.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-property-process-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './property-process-view.component.html',
  styleUrl: './property-process-view.component.scss',
})

export class PropertyProcessViewComponent implements OnInit {
  @Input() immobilienId!: string;
  immobilie?: Immobilie;
  isAdmin = false;
  isLoading = true;

  constructor(
    private immobilienService: ImmobilienService,
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
        // 🔍 Kunden mit Rolle "Interessent" und Anfrage zur Immobilie
        // const allCustomers = await this.customerService.getAllCustomers();

        // const interessenten = allCustomers.filter(
        //   (c) =>
        //     c.roles?.includes(CustomerRole.Interessent) &&
        //     c.buyerData?.angefragteImmobilienIds?.includes(this.immobilienId)
        // );

        // // 🔢 Sortieren nach Erstellungsdatum (neueste zuerst)
        // this.customer = interessenten.sort(
        //   (a, b) =>
        //     new Date(b.creationDate || '').getTime() -
        //     new Date(a.creationDate || '').getTime()
        // );

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
}
