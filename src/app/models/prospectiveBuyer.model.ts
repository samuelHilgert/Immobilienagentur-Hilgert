// Intercface erweitert Customer wenn Rolle Interessent ist

// Sozusagen das Käuferprofil. Wichtige Infos, um Kunden nicht nur für die aktuell angefragte Immobilie einzuschätzen. 
// Anhand dieser Infos kann ich auch andere Immobilien vorschlagen
export interface prospectiveBuyer {
  angefragteImmobilienIds?: string[];       // können mehrere sein 
  netIncome?: number | null;                 // Nettoeinkommen
  equity?: number | null;                    // Eigenkapital
  existingProperties?: string | null;        // Vorhandene Immobilien, Ja oder 4 ETWs oder 2 Häuser 
  stockAssets?: number | null;               // Vorhandene Aktien 
  bankConfirmation?: {                       // Ältere Bankbestätigung vorhanden
    available: boolean; 
    amount?: number | null;                  // Höhe Bankbestätigung, wenn true
  };
  numberOfBuyers?: number | null;            // Anzahl Kaufende Personen
  numberOfOccupants?: number | null;         // Anzahl Einziehende Personen
  preferredLocations?: string[] | null;      // Gesuchte Orte mit Kommas getrennt
  otherDescription?: string | null;          // Sonstige Beschreibung von mir ergänzt
  Financiers?: string | null;                // Hat der Kunde einen Finanzierer an der Hand oder bevorzugt er eine bestimmte Bank?
}
