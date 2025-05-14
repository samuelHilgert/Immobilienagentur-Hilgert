// Intercface erweitert Customer wenn Rolle Interessent ist

// Sozusagen das Käuferprofil. Wichtige Infos, um Kunden nicht nur für die aktuell angefragte Immobilie einzuschätzen. 
// Anhand dieser Infos kann ich auch andere Immobilien vorschlagen
export interface prospectiveBuyer {
  angefragteImmobilienIds?: string[]; // können mehrere sein 
  netIncome?: number; // Nettoeinkommen
  equity?: number; // Eigenkapital
  existingProperties?: string; // Vorhandene Immobilien, Ja oder 4 ETWs oder 2 Häuser 
  stockAssets?: number; // Vorhandene Aktien 
  bankConfirmation?: { // Ältere Bankbestätigung vorhanden
    available?: boolean; 
    amount?: number; // Höhe Bankbestätigung, wenn true
  };
  numberOfBuyers?: number; // Anzahl Kaufende Personen
  numberOfOccupants?: number; // Anzahl Einziehende Personen
  preferredLocations?: string[]; // Gesuchte Orte mit Kommas getrennt
  otherDescription?: string; // Sonstige Beschreibung von mir ergänzt
  Financiers?: string; // Hat der Kunde einen Finanzierer an der Hand oder bevorzugt er eine bestimmte Bank?
}
