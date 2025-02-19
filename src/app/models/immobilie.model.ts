export interface Immobilie {
  id: string;
  titel: string;
  beschreibung?: string;
  preis: string;
  art: string;
  objekt_typ: string;
  status?: string; 
  plz?: string; 
  stadt?: string;
  erstellt_am?: string; 
  aktualisiert_am?: string;
}
