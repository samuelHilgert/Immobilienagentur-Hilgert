import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { writeBatch } from 'firebase/firestore'; // NEW
import { CarRide, CarRideYear } from '../models/car-ride.model';

@Injectable({ providedIn: 'root' })
export class CarRidesService {
  constructor(private afs: Firestore) {}

  private yearsCol() {
    return collection(this.afs, 'car-ride-years');
  }
  private ridesCol(year: number) {
    return collection(this.afs, `car-ride-years/${year}/rides`);
  }

  async addYear(year: number): Promise<CarRideYear> {
    const id = String(year);
    const ref = doc(this.afs, 'car-ride-years', id);
    const now = new Date().toISOString();
    await setDoc(ref, { year, createdAt: now } as CarRideYear, { merge: true });
    return { id, year, createdAt: now };
  }

  async getYearsDesc(): Promise<CarRideYear[]> {
    const q = query(this.yearsCol(), orderBy('year', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  }

  // --- rides ---
  // NEW: accept order (component decides next top order)
  async addRide(year: number, order: number): Promise<CarRide> {
    const now = new Date().toISOString();
    const newRide: CarRide = {
      date: '',
      start: '',
      ziel: '',
      anlass: '',
      km: 0,
      wayBack: false,
      order,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await addDoc(this.ridesCol(year), newRide as any);
    return { ...newRide, id: docRef.id };
  }

  async getRidesDesc(year: number): Promise<CarRide[]> {
    const q = query(this.ridesCol(year), orderBy('order', 'desc')); // NEW
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  }

  async updateRide(year: number, rideId: string, patch: Partial<CarRide>) {
    const ref = doc(this.afs, `car-ride-years/${year}/rides/${rideId}`);
    await updateDoc(ref, {
      ...patch,
      updatedAt: new Date().toISOString(),
    } as any);
  }

  // NEW: batch update multiple orders after drag
  async updateOrders(year: number, items: { id: string; order: number }[]) {
    const batch = writeBatch(this.afs as any);
    const now = new Date().toISOString();
    for (const it of items) {
      const ref = doc(this.afs, `car-ride-years/${year}/rides/${it.id}`);
      batch.update(ref, { order: it.order, updatedAt: now } as any);
    }
    await batch.commit();
  }

  async deleteRide(year: number, rideId: string) {
    const ref = doc(this.afs, `car-ride-years/${year}/rides/${rideId}`);
    await deleteDoc(ref);
  }
}
