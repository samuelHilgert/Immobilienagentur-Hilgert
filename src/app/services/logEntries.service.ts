import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { PropertyInquiryProcess } from '../models/property-inquiry-process.model';
import { createLogEntry, addLogEntryToProcess } from '../utils/log-entry.util';

// log-entries.service.ts

@Injectable({ providedIn: 'root' })
export class LogEntriesService {
  constructor(private firestore: Firestore) {}

  async logProcessEntry(
    processId: string,
    user: string,
    action: string,
    comment?: string
  ): Promise<void> {
    try {
      const processRef = doc(this.firestore, 'property-inquiry-processes', processId);
      const snap = await getDoc(processRef);

      if (!snap.exists()) {
        console.warn(`[Log] Prozess mit ID ${processId} nicht gefunden.`);
        return;
      }

      const process = snap.data() as PropertyInquiryProcess;
      const entry = createLogEntry(action, user, comment);
      addLogEntryToProcess(process, entry);

      await setDoc(processRef, process, { merge: true });
    } catch (error) {
      console.error(`[Log] Fehler beim Schreiben des Log-Eintrags für ${processId}:`, error);
    }
  }
}
