export enum Gesucht {
  WOHNUNG = 'Wohnung',
  HAUS = 'Haus',
  GRUNDSTUECK = 'Grundstück',
}

export interface Suchauftrag {
  suchauftragId?: string;
  gesucht: 'Wohnung' | 'Haus' | 'Grundstück';
  art: 'Miete' | 'Kauf';
  budget?: string;
  eigenkapital?: number;
  rendite?: string;
  risiko?: 'riskant' | 'solide' | 'sicher';
  orte?: string[];
  personenAnzahl: number;
  einkommenNetto?: number;
  notizen?: string;
  createdAt: string; // Erstellungsdatum (ISO-String)
  updatedAt?: string; // Letzte Aktualisierung (ISO-String)
}
