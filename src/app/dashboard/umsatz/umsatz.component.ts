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
  styleUrls: ['./umsatz.component.scss'], // <-- fix
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

  // ---------- Helpers ----------
  private round2(n: number): number {
    return +(n.toFixed(2));
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

  // Anzeigezweck (Netto-Satz je Partei, 2 NK, Multiplizieren im Template ×2):
  getProvisionSatzNetto(courtage?: string): number | null {
    const brutto = this.extractCourtageProzent(courtage);
    return brutto ? this.round2(brutto / 1.19) : null;
  }

  // ---------- Provision & Steuer (rechnungstauglich) ----------
  // Brutto direkt aus Brutto-Gesamtsatz (2 × Parteiensatz):
  getProvisionBruttoDirekt(preis: number | null, satzBruttoProPartei: number): number {
    if (!preis || preis <= 0) return 0;
    const satzBruttoGesamt = (satzBruttoProPartei * 2) / 100; // z.B. 5,14 % gesamt
    return this.round2(preis * satzBruttoGesamt);
  }

  getProvisionNettoVonBrutto(brutto: number): number {
    if (!brutto) return 0;
    return this.round2(brutto / 1.19);
  }

  getUmsatzsteuerVonBrutto(brutto: number): number {
    const netto = this.getProvisionNettoVonBrutto(brutto);
    return this.round2(brutto - netto);
  }

  // ---------- Weitere Kennzahlen (alle mit 2 NK) ----------
  getEinkSt(provisionNetto: number): number {
    return this.round2(provisionNetto / 3);
  }

  getBetriebsausgaben(provisionNetto: number): number {
    return this.round2(provisionNetto * 0.03);
  }

  getGKVBeitrag(provisionNetto: number): number {
    const betriebsausgaben = this.getBetriebsausgaben(provisionNetto);
    const beitragsgrundlage = provisionNetto - betriebsausgaben;
    const beitragssatz = 0.15;
    return this.round2(beitragsgrundlage * beitragssatz);
  }

  getLohnBrutto(provisionNetto: number): number {
    const einkSt = this.getEinkSt(provisionNetto);
    const betriebskosten = this.getBetriebsausgaben(provisionNetto);
    const gkvBeitrag = this.getGKVBeitrag(provisionNetto);
    return this.round2(provisionNetto - einkSt - betriebskosten - gkvBeitrag);
  }

  getSpenden(lohnBrutto: number): number {
    return this.round2(lohnBrutto * 0.1);
  }

  getLohnNetto(provisionNetto: number): number {
    const lohnBrutto = this.getLohnBrutto(provisionNetto);
    const spenden = this.getSpenden(lohnBrutto);
    return this.round2(lohnBrutto - spenden);
  }

  getLohnMonatlich(provisionNetto: number): number {
    return this.round2(this.getLohnNetto(provisionNetto) / 12);
  }

  // ---------- Summen (Summe der je-Objekt bereits gerundeten Beträge) ----------
  getAngebotspreisSumme(): number {
    return this.round2(this.immobilien.reduce((sum, immo) => sum + (immo.value || 0), 0));
  }

  getProvisionBruttoSumme(): number {
    return this.round2(this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      const brutto = (satz !== null) ? this.getProvisionBruttoDirekt(immo.value, satz) : 0;
      return sum + brutto;
    }, 0));
  }

  getProvisionNettoSumme(): number {
    return this.round2(this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz === null) return sum;
      const brutto = this.getProvisionBruttoDirekt(immo.value, satz);
      const netto = this.getProvisionNettoVonBrutto(brutto);
      return sum + netto;
    }, 0));
  }

  getUmsatzsteuerSumme(): number {
    return this.round2(this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz === null) return sum;
      const brutto = this.getProvisionBruttoDirekt(immo.value, satz);
      const ust = this.getUmsatzsteuerVonBrutto(brutto);
      return sum + ust;
    }, 0));
  }

  getEinkStSumme(): number {
    return this.round2(this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz === null) return sum;
      const brutto = this.getProvisionBruttoDirekt(immo.value, satz);
      const netto = this.getProvisionNettoVonBrutto(brutto);
      return sum + this.getEinkSt(netto);
    }, 0));
  }

  getBetriebsausgabenSumme(): number {
    return this.round2(this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz === null) return sum;
      const brutto = this.getProvisionBruttoDirekt(immo.value, satz);
      const netto = this.getProvisionNettoVonBrutto(brutto);
      return sum + this.getBetriebsausgaben(netto);
    }, 0));
  }

  getGKVBeitragSumme(): number {
    return this.round2(this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz === null) return sum;
      const brutto = this.getProvisionBruttoDirekt(immo.value, satz);
      const netto = this.getProvisionNettoVonBrutto(brutto);
      return sum + this.getGKVBeitrag(netto);
    }, 0));
  }

  getLohnBruttoSumme(): number {
    return this.round2(this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz === null) return sum;
      const brutto = this.getProvisionBruttoDirekt(immo.value, satz);
      const netto = this.getProvisionNettoVonBrutto(brutto);
      return sum + this.getLohnBrutto(netto);
    }, 0));
  }

  getSpendenSumme(): number {
    return this.round2(this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz === null) return sum;
      const brutto = this.getProvisionBruttoDirekt(immo.value, satz);
      const netto = this.getProvisionNettoVonBrutto(brutto);
      const lohnBrutto = this.getLohnBrutto(netto);
      return sum + this.getSpenden(lohnBrutto);
    }, 0));
  }

  getLohnNettoSumme(): number {
    return this.round2(this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz === null) return sum;
      const brutto = this.getProvisionBruttoDirekt(immo.value, satz);
      const netto = this.getProvisionNettoVonBrutto(brutto);
      return sum + this.getLohnNetto(netto);
    }, 0));
  }

  getLohnMonatlichSumme(): number {
    return this.round2(this.immobilien.reduce((sum, immo) => {
      const satz = this.extractCourtageProzent(immo.courtage);
      if (satz === null) return sum;
      const brutto = this.getProvisionBruttoDirekt(immo.value, satz);
      const netto = this.getProvisionNettoVonBrutto(brutto);
      return sum + this.getLohnMonatlich(netto);
    }, 0));
  }

  // ---------- UI Aktionen ----------
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
