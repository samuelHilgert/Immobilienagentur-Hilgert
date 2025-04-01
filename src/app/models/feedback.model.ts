// ✅ NEUES INTERFACE für Bewertungen
import { Timestamp } from 'firebase/firestore';

export interface Feedback {
  bewertungId: string;
  publicAccepted: boolean;
  text: string;
  antwort?: string;
  rating: number;
  autorName: string;
  autorEmail: string;
  Customer?: Boolean;
  customerId?: string;
  creationDate: Date | Timestamp;
}
