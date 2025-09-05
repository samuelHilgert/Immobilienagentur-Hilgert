import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material-imports';
import { MatTableModule } from '@angular/material/table';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CarRidesService } from '../../services/car-rides.service';
import { CarRide, CarRideYear } from '../../models/car-ride.model';

// Falls genutzt:
declare const html2pdf: any;

type UiYear = CarRideYear & { rides: CarRide[]; expanded: boolean };

@Component({
  selector: 'app-car-rides',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MATERIAL_MODULES,
    MatTableModule,
    DragDropModule,
  ],
  templateUrl: './car-rides.component.html',
  styleUrl: './car-rides.component.scss',
})
export class CarRidesComponent implements OnInit {
  years: UiYear[] = [];
  displayedColumns = ['date', 'start', 'ziel', 'anlass', 'km', 'actions'];
  private editSaving = false;

  // Aktuelle Edit-Zelle
  editing: {
    year?: number;
    rideId?: string;
    field?: keyof CarRide;
    value?: any;
    original?: any;
  } = {};

  constructor(private ridesSvc: CarRidesService) {}

  async ngOnInit() {
    await this.reloadAll();
  }

  private async reloadAll() {
    const years = await this.ridesSvc.getYearsDesc();
    const ui: UiYear[] = [];
    for (const y of years) {
      const rides = await this.ridesSvc.getRidesDesc(y.year);
      ui.push({ ...y, rides, expanded: true });
    }
    this.years = ui.sort((a, b) => b.year - a.year);
  }

  async onAddYear() {
    const input = prompt('Welches Jahr hinzufügen? (z.B. 2025)');
    if (!input) return;
    const year = Number(input);
    if (!year || year < 1900 || year > 2999) {
      alert('Bitte ein gültiges Jahr angeben.');
      return;
    }
    const created = await this.ridesSvc.addYear(year);
    this.years = [
      { ...created, rides: [], expanded: true },
      ...this.years.filter((y) => y.year !== year),
    ];
  }

  toggleYear(y: UiYear) {
    y.expanded = !y.expanded;
  }

  // Neue Fahrt oben einfügen (höchster order)
  async addRide(y: UiYear) {
    await this.commitPendingIfAny(); // offene Zelle zuerst speichern
    const nextTopOrder = (y.rides[0]?.order ?? 0) + 1;
    const ride = await this.ridesSvc.addRide(y.year, nextTopOrder);
    y.rides = [ride, ...y.rides];
    await this.startEdit(y.year, ride.id!, 'date', ride.date);
  }

  async deleteRow(y: UiYear, ride: CarRide) {
    await this.commitPendingIfAny(); // offene Zelle zuerst speichern
    if (!ride.id) return;
    if (!confirm('Diese Fahrt wirklich löschen?')) return;
    await this.ridesSvc.deleteRide(y.year, ride.id);
    y.rides = y.rides.filter((r) => r.id !== ride.id);
  }

  // ⛳ Vor dem Start einer neuen Edit-Zelle: offene Zelle committen
  private async commitPendingIfAny(target?: {
    year: number;
    rideId: string;
    field: keyof CarRide;
  }) {
    const e = this.editing;
    if (!e.year || !e.rideId || !e.field) return;
    // gleiche Zelle? Dann nichts tun
    if (
      target &&
      e.year === target.year &&
      e.rideId === target.rideId &&
      e.field === target.field
    )
      return;
    // Commit der offenen Zelle
    await this.commitSpecific(e.year, e.rideId, e.field, e.value);
  }

  // Startet den Edit-Modus – commitet vorher offene Zelle
  async startEdit(
    year: number,
    rideId: string,
    field: keyof CarRide,
    currentValue: any
  ) {
    await this.commitPendingIfAny({ year, rideId, field });
    this.editing = {
      year,
      rideId,
      field,
      value: currentValue,
      original: currentValue,
    };
  }

  // Enter speichert die *aktuelle* Zelle
  async onCellKeydown(
    ev: KeyboardEvent,
    year: number,
    rideId: string,
    field: keyof CarRide
  ) {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      await this.commitSpecific(year, rideId, field, this.editing.value);
    } else if (ev.key === 'Escape') {
      this.cancelEdit();
    }
  }

  // Blur speichert die *verlassene* Zelle zuverlässig
  async onCellBlur(
    year: number,
    rideId: string,
    field: keyof CarRide,
    value: any
  ) {
    if (this.editSaving) return;
    await this.commitSpecific(year, rideId, field, value);
  }

  private async commitSpecific(
    year: number,
    rideId: string,
    field: keyof CarRide,
    value: any
  ) {
    if (this.editSaving) return;
    this.editSaving = true;

    try {
      const y = this.years.find((x) => x.year === year);
      const r = y?.rides.find((x) => x.id === rideId);
      if (!r) return;

      const patch: Partial<CarRide> = {};

      if (field === 'km') {
        const raw = (value ?? '').toString().trim();
        const num = Number(raw);
        const nextKm = Number.isFinite(num) ? num : 0; // ggf. auf null umstellen, falls gewünscht
        if (r.km !== nextKm) (patch as any).km = nextKm;
      } else {
        const str = String(value ?? '').trim();
        if ((r as any)[field] !== str) (patch as any)[field] = str;
      }

      // Nichts geändert?
      if (Object.keys(patch).length === 0) {
        this.editing = {};
        return;
      }

      await this.ridesSvc.updateRide(year, rideId, patch);
      Object.assign(r, patch);
    } finally {
      this.editSaving = false;
      this.editing = {};
    }
  }

  cancelEdit() {
    this.editing = {};
  }

  isEditing(ride: CarRide, field: keyof CarRide) {
    return this.editing.rideId === ride.id && this.editing.field === field;
  }

  // Drag & Drop Reorder
  async dropRow(event: CdkDragDrop<CarRide[]>, yearIdx: number) {
    await this.commitPendingIfAny(); // offene Zelle zuerst speichern
    const y = this.years[yearIdx];
    if (!y) return;
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(y.rides, event.previousIndex, event.currentIndex);

    // neue Order-Werte (höchste Zahl oben)
    const topBase = Math.max(...y.rides.map((r) => r.order ?? 0), 0);
    const startOrder = topBase + y.rides.length;
    const updates = y.rides.map((r, idx) => {
      r.order = startOrder - idx;
      return { id: r.id!, order: r.order };
    });

    await this.ridesSvc.updateOrders(y.year, updates);
  }

  async exportPdf(year: UiYear) {
    const el = document.getElementById(`year-table-${year.year}`);
    if (!el) return;
    (html2pdf as any)()
      .from(el)
      .set({
        margin: 10,
        filename: `fahrtenbuch_${year.year}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .save();
  }

  trackRide(_i: number, r: CarRide) {
    return r.id;
  }

  async toggleWayBack(year: number, ride: CarRide, ev: Event) {
    // Erst offene Zelle (falls vorhanden) speichern, damit Werte nicht verloren gehen
    await this.commitPendingIfAny();

    const checked = (ev.target as HTMLInputElement).checked;
    if (ride.wayBack === checked) return; // nichts zu tun

    await this.ridesSvc.updateRide(year, ride.id!, { wayBack: checked });
    ride.wayBack = checked; // UI aktualisieren
  }
}
