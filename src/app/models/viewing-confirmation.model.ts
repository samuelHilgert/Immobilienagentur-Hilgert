export interface ViewingConfirmation {
    inquiryProcessId: string;          // = "{customerId}_{propertyExternalId}"
    customerId: string;
    propertyExternalId: string;
  
    // Termin-/Anzeige-Infos (werden beim Mailversand gesetzt)
    appointmentDate?: any;             // Firestore Timestamp
    addressLine?: string;              // "Musterstr. 1"
    zip?: string;
    city?: string;
  
    blocked?: boolean;                 // Link sperren (falls nötig)
    createdAt?: any;                   // Timestamp
  
    // Vom Kunden (öffentl. Seite) gesetzt:
    acceptedGuidelines?: boolean;
    confirmedAt?: any;                 // Timestamp
    confirmUa?: string;                // navigator.userAgent
    note?: string;                     // optionaler Hinweis
  }
  