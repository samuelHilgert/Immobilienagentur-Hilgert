// Intercface erweitert Customer wenn Rolle Interessent ist

export interface prospectiveBuyer {
  angefragteImmobilienIds?: string[]; // können mehrere sein 

  netIncome?: number; // Nettoeinkommen
  equity?: number; // Eigenkapital
  existingProperties?: string; // Vorhandene Immobilien, Ja oder 4 ETWs oder 2 Häuser 
  stockAssets?: number; // Vorhandene Aktien 
  bankConfirmation?: { // Bankbestätigung
    available?: boolean; 
    amount?: number; // Höhe Bankbestätigung, wenn true
  };
  numberOfBuyers?: number; // Anzahl Kaufende Personen
  numberOfOccupants?: number; // Anzahl Einziehende Personen
  preferredLocations?: string[]; // Gesuchte Orte mit Kommas getrennt
  firstViewingDate?: Date; // Erster Besichtigungstag
  secondViewingDate?: Date; // Zweiter Besichtigungstag
  notaryAppointmentDate?: Date; // Notartermin
  finalPurchasePrice?: number; // Finaler Verkaufspreis
  handoverDate?: Date; // Übergabetermin
  processStatus?: // Status Prozess
    | 'Anfrage'
    | 'Exposé erhalten'
    | 'Kleiner Bonitätscheck'
    | 'Erstbesichtigung'
    | 'Zweitbesichtigung'
    | 'Bankbestätigung'
    | 'Großer Bonitätscheck'
    | 'Darlehensvertrag'
    | 'Notartermin'
    | 'Übergabe';
  requestMessage?: string; // Message aus expose anfrage
  otherDescription?: string; // Sonstige Beschreibung von mir ergänzt
  // 📩 Mail send tracking
  mailExposeSentAt?: { [externalId: string]: string[] };
  mailAppointmentConfirmationSentAt?: string[];
  mailCreditCheckSentAt?: string[];
  mailDropboxLinkSentAt?: string[];
}
