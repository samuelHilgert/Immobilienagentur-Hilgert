// src/app/services/customer.service.ts

import { Injectable } from '@angular/core';
import {
  getFirestore, collection, doc, setDoc, getDoc, getDocs,
  updateDoc, deleteDoc
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environments';
import { Customer } from '../models/customer.model';
import { prospectiveBuyer } from '../models/prospectiveBuyer.model';

type FullCustomer = Customer & { buyerData?: prospectiveBuyer };
@Injectable({
  providedIn: 'root'
})


export class CustomerService {

  private app = initializeApp(environment.firebase);
  private db = getFirestore(this.app);

  constructor() {}

  // Neuen Kunden speichern oder bestehenden aktualisieren
  async saveCustomer(customer: FullCustomer): Promise<{ success: boolean; id?: string; error?: any }> {
    try {
      const id = customer.customerId || doc(collection(this.db, 'customers')).id;
      const customerRef = doc(this.db, 'customers', id);
      await setDoc(customerRef, JSON.parse(JSON.stringify({ ...customer, customerId: id })), { merge: true });
  
      return { success: true, id };
    } catch (error) {
      console.error('Fehler beim Speichern des Kunden:', error);
      return { success: false, error };
    }
  }  
  
  // Falls du Kunden explizit mit einer neuen ID erzeugen willst
  async createEmptyCustomerId(): Promise<string> {
    const newDocRef = doc(collection(this.db, 'customers'));
    return newDocRef.id; // Liefert eine neue ID zurück, wird aber noch NICHT gespeichert
  }  

  // Einzelnen Kunden abrufen
  async getCustomer(id: string): Promise<Customer | null> {
const ref = doc(this.db, 'customers', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
  
    const data = snap.data();
  
    // Optional: Logging
    console.log('📦 Geladener Kunde:', data);
  
    // Falls buyerData fehlt, initialisiere es als leeres Objekt
    if (!data['buyerData']) {
      data['buyerData'] = {};
    }    
  
    return data as Customer;
  }
  

  // Alle Kunden abrufen
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const customersRef = collection(this.db, 'customers');
      const snapshot = await getDocs(customersRef);
      const customers: Customer[] = [];
  
      snapshot.forEach(doc => {
        const data = doc.data();
  
        // 🛡️ Sicherstellen, dass buyerData und angefragteImmobilienIds vorhanden sind
        if (!data['buyerData']) {
          data['buyerData'] = {};
        }
  
        if (!Array.isArray(data['buyerData'].angefragteImmobilienIds)) {
          data['buyerData'].angefragteImmobilienIds = [];
        }
  
        customers.push({ ...(data as Customer), customerId: doc.id });
      });
  
      return customers;
    } catch (error) {
      console.error('Fehler beim Abrufen der Kunden:', error);
      return [];
    }
  }  

  // Kunde aktualisieren
  async updateCustomer(customerId: string, data: Partial<Customer>): Promise<{ success: boolean; error?: any }> {
    try {
      const customerRef = doc(this.db, 'customers', customerId);
      await updateDoc(customerRef, data);
      return { success: true };
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kunden:', error);
      return { success: false, error };
    }
  }

  // Kunde löschen
  async deleteCustomer(customerId: string): Promise<{ success: boolean; error?: any }> {
    try {
      const customerRef = doc(this.db, 'customers', customerId);
      await deleteDoc(customerRef);
      return { success: true };
    } catch (error) {
      console.error('Fehler beim Löschen des Kunden:', error);
      return { success: false, error };
    }
  }

  async getNextCustomerIndexId(): Promise<number> {
    try {
      const customerRef = collection(this.db, 'customers');
      const snapshot = await getDocs(customerRef);
  
      const maxIndex = snapshot.docs
        .map((doc) => Number(doc.data()['indexId']))
        .filter((id) => !isNaN(id) && id >= 0)
        .reduce((max, id) => (id > max ? id : max), 0);
  
      return maxIndex + 2;
    } catch (error) {
      console.error('Fehler beim Ermitteln der höchsten indexId für Kunden:', error);
      return 2;
    }
  }  

  private generateRandomId(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }
  
  // async generateUniqueCustomerId(): Promise<string> {
  //   let uniqueId = '';
  //   let exists = true;
  
  //   const customerRef = collection(this.db, 'customers');
  
  //   while (exists) {
  //     const potentialId = this.generateRandomId();
  //     const snapshot = await getDocs(customerRef);
  
  //     exists = snapshot.docs.some(
  //       (doc) => doc.data()['customerId'] === potentialId
  //     );
  
  //     if (!exists) {
  //       uniqueId = potentialId;
  //     }
  //   }
  
  //   return uniqueId;
  // }
  
}
