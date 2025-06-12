import { Component } from '@angular/core';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { ImmobilienService } from '../../services/immobilien.service';
import { Immobilie } from '../../models/immobilie.model';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-umsatz',
  standalone: true,
  imports: [MATERIAL_MODULES],
  templateUrl: './umsatz.component.html',
  styleUrl: './umsatz.component.scss',
})
export class UmsatzComponent {
  immobilien: Immobilie[] = [];
  kundenMap = new Map<string, Customer>();
  isLoading = true;
  alleImmobilien: Immobilie[] = [];
ausgewaehlteImmobilieId: string | null = null;


  constructor(
    private immobilienService: ImmobilienService,
    private customerService: CustomerService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [geladeneImmobilien, alleKunden] = await Promise.all([
        this.immobilienService.getProperties(),
        this.customerService.getAllCustomers(),
      ]);
  
      this.alleImmobilien = geladeneImmobilien;
  
      this.kundenMap = new Map(alleKunden.map(k => [k.customerId, k]));

this.immobilien = geladeneImmobilien.filter(immo =>
  ['Angebot', 'Reserviert'].includes(immo.propertyStatus) &&
  this.extractCourtageProzent(immo.courtage) !== null
);

      
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      this.isLoading = false;
    }
  }  

  getVerfuegbareImmobilien(): Immobilie[] {
    return this.alleImmobilien.filter(i =>
      !this.immobilien.some(sel => sel.externalId === i.externalId)
    );
  }
  
  getKundenNachnamen(customerIds: string[]): string {
    if (!customerIds?.length) return '-';
    return customerIds
      .map(id => this.kundenMap.get(id)?.lastName || 'Unbekannt')
      .join(', ');
  }

  extractCourtageProzent(courtage?: string): number | null {
    if (!courtage || courtage.trim() === '') return null;
    const match = courtage.match(/[\d.,]+/);
    return match ? parseFloat(match[0].replace(',', '.')) : null;
  }

  getProvisionSatzNetto(courtage?: string): number | null {
    const brutto = this.extractCourtageProzent(courtage);
    return brutto ? +(brutto / 1.19).toFixed(2) : null;
  }  

  getProvisionNetto(preis: number | null, satz: number): number {
    if (!preis || preis <= 0) return 0;
    return Math.round(preis * ((satz / 1.19) * 2 / 100));
  }

  getUmsatzsteuer(betrag: number): number {
    return Math.round(betrag * 0.19);
  }

  getProvisionBrutto(netto: number): number {
    return Math.round(netto * 1.19);
  }

  getEinkSt(provisionNetto: number): number {
    return Math.round(provisionNetto / 3);
  }

  getBetriebsausgaben(provisionNetto: number): number {
    return Math.round(provisionNetto * 0.03);
  }
    
  getLohnBrutto(provisionNetto: number): number {
    const einkSt = this.getEinkSt(provisionNetto);
    const betriebskosten = this.getBetriebsausgaben(provisionNetto);
    const gkvBeitrag = this.getGKVBeitrag(provisionNetto);
    return provisionNetto - einkSt - betriebskosten - gkvBeitrag;
  }

  getSpenden(lohnBrutto: number): number {
    return Math.round(lohnBrutto * 0.1);
  }

  getLohnNetto(provisionNetto: number): number {
    const lohnBrutto = this.getLohnBrutto(provisionNetto);
    const spenden = this.getSpenden(lohnBrutto);
    return lohnBrutto - spenden;
  }

  getLohnMonatlich(provisionNetto: number): number {
    return Math.round(this.getLohnNetto(provisionNetto) / 12);
  }

  // Summen addieren
  
  getAngebotspreisSumme(): number {
    return this.immobilien.reduce((sum, immo) => sum + (immo.value || 0), 0);
  }
  
  getProvisionNettoSumme(): number {
    return this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz !== null) {
        return sum + this.getProvisionNetto(immo.value, satz);
      }
      return sum;
    }, 0);
  }

  getUmsatzsteuerSumme(): number {
    return this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz !== null) {
        const netto = this.getProvisionNetto(immo.value, satz);
        return sum + this.getUmsatzsteuer(netto);
      }
      return sum;
    }, 0);
  }

  getProvisionBruttoSumme(): number {
    return this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz !== null) {
        const netto = this.getProvisionNetto(immo.value, satz);
        return sum + this.getProvisionBrutto(netto);
      }
      return sum;
    }, 0);
  }

  getEinkStSumme(): number {
    return this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz !== null) {
        const netto = this.getProvisionNetto(immo.value, satz);
        return sum + this.getEinkSt(netto);
      }
      return sum;
    }, 0);
  }

  getBetriebsausgabenSumme(): number {
    return this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz !== null) {
        const netto = this.getProvisionNetto(immo.value, satz);
        return sum + this.getBetriebsausgaben(netto);
      }
      return sum;
    }, 0);
  }

  getGKVBeitrag(provisionNetto: number): number {
    const betriebsausgaben = this.getBetriebsausgaben(provisionNetto);
    const beitragsgrundlage = provisionNetto - betriebsausgaben;
  
    const beitragssatz = 0.15; // 15 % für GKV + Pflege
    return Math.round(beitragsgrundlage * beitragssatz);
  }
  
  getGKVBeitragSumme(): number {
    return this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz !== null) {
        const netto = this.getProvisionNetto(immo.value, satz);
        return sum + this.getGKVBeitrag(netto);
      }
      return sum;
    }, 0);
  }

  getLohnBruttoSumme(): number {
    return this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz !== null) {
        const netto = this.getProvisionNetto(immo.value, satz);
        return sum + this.getLohnBrutto(netto);
      }
      return sum;
    }, 0);
  }

  getSpendenSumme(): number {
    return this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz !== null) {
        const netto = this.getProvisionNetto(immo.value, satz);
        const bruttoLohn = this.getLohnBrutto(netto);
        return sum + this.getSpenden(bruttoLohn);
      }
      return sum;
    }, 0);
  }

  getLohnNettoSumme(): number {
    return this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz !== null) {
        const netto = this.getProvisionNetto(immo.value, satz);
        return sum + this.getLohnNetto(netto);
      }
      return sum;
    }, 0);
  }

  getLohnMonatlichSumme(): number {
    return this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz !== null) {
        const netto = this.getProvisionNetto(immo.value, satz);
        return sum + this.getLohnMonatlich(netto);
      }
      return sum;
    }, 0);
  }
  
  addAusgewaehlteImmobilie(): void {
    const immo = this.alleImmobilien.find(i => i.externalId === this.ausgewaehlteImmobilieId);
    if (immo && !this.immobilien.some(i => i.externalId === immo.externalId)) {
      this.immobilien.push(immo);
      this.ausgewaehlteImmobilieId = null;
    }
  }
  
  confirmRemove(index: number): void {
    if (confirm('Bist du sicher, dass du dieses Objekt entfernen möchtest?')) {
      this.removeImmobilie(index);
    }
  }  
  
  removeImmobilie(index: number): void {
    this.immobilien.splice(index, 1);
  }
  
  
}
