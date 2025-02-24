export enum KundeRolle {
  INTERESSENT = 'Interessent',
  EIGENTUEMER = 'Eigentümer',
  KAUEFER = 'Käufer',
  MIETER = 'Mieter',
  FIRMA = 'Firma',
  INVESTOR = 'Investor',
  TIPPGEBER = 'Tippgeber',
  SONSTIGE = 'Sonstige',
}

export interface Kunde {
  kundenId: string;
  anrede: string;
  vorname: string;
  nachname: string;
  strasse?: string;
  hausnummer?: number;
  plz: string;
  stadt: string;
  email?: string;
  telefon?: string;
  mobil?: string;
  rollen: KundeRolle[]; // Ein Kunde kann mehrere Rollen haben
  // Zusatzinfos für Interessenten:
  interessentenDaten?: {
    formularErhalten?: 'Ja' | 'Nein' | 'nicht notwendig';
    richtlinienAkzeptiert?: 'Ja' | 'Nein' | 'nicht notwendig';
    angefragteImmobilie?: string; // Immobilie-ID (nur eine, wenn andere dann neuer Kunden-Eintrag)
    suchauftrag?: string[]; // Ein Kunde kann mehrere Suhaufträge haben, suchauftragId wird eingespeichert
    statusAnfrage?:
      | 'Erstanfrage'
      | 'Richtlinien akzeptiert'
      | 'Exposé erhalten'
      | '1. BT Bestätigung erhalten'
      | '1. BT Erinnerung erhalten'
      | 'Erstbesichtigung abgeschlossen'
      | 'Weitere Unterlagen erhalten'
      | 'Begleitung'
      | '2. BT Bestätigung erhalten'
      | '2. BT Erinnerung erhalten'
      | 'Zweitbesichtigung abgeschlossen'
      | 'Finanzierungsgespräche'
      | 'Verhandlung'
      | 'Abgelehnt';
  };
  // Zusatzinfos für Eigentümer:
  eigentuemerDaten?: {
    immobilienBesitz?: string[]; // Liste von Immobilien-IDs oder Bezeichnungen
    preisvorstellung?: string;
    verkaufsdringlichkeit?:
      | 'so schnell wie möglich'
      | 'innerhalb von 3-6 Monaten'
      | 'innerhalb eines Jahres'
      | 'darüber hinaus möglich';
    beziehungsstatus?:
      | 'verfügbar'
      | 'abwartend'
      | 'beratend'
      | 'vermittelnd'
      | 'abgelehnt';
    vertragsstatus?: 'kein Auftrag' | 'EMA' | 'EAA' | 'QAA';
    vertragslaufzeit?: string;
    schwierigkeit?:
      | 'einfach'
      | 'gesprächsoffen'
      | 'zurückhaltend'
      | 'desinteressiert'
      | 'ablehnend'
      | 'schwierig'
      | 'gebrochen';
    zufriedenheit?: number; // 1 bis 10
    kontaktUeber?: string; // z.B. Lead, Webseite, Kontakt durch xy
  };
  // Zusatzinfos für Käufer:
  kaueferDaten?: {
    immobilienBesitz?: string[];
    zufriedenheit?: number; // 1 bis 10
  };
  // Zusatzinfos für Mieter:
  mieterDaten?: {
    bewohnteImmobilie?: string; // Immobilien-IDs oder Bezeichnung
    schwierigkeit?:
      | 'einfach'
      | 'gesprächsoffen'
      | 'zurückhaltend'
      | 'desinteressiert'
      | 'ablehnend'
      | 'schwierig'
      | 'gebrochen';
  };
  // Zusatzinfos für Firmen:
  firmaDaten?: {
    formularErhalten?: 'Ja' | 'Nein' | 'nicht notwendig';
    richtlinienAkzeptiert?: 'Ja' | 'Nein' | 'nicht notwendig';
    partner?: boolean;
    firmenName?: string;
    rechtsform?: string;
    branche?: string;
    bereich?: string;
    strasse?: string;
    hausnummer?: number;
    plz: string;
    stadt: string;
    email?: string;
    telefon?: string;
    mobil?: string;
    ansprechpartner?: string;
  };
  // Zusatzinfos für Investoren:
  investorDaten?: {
    formularErhalten?: 'Ja' | 'Nein' | 'nicht notwendig';
    richtlinienAkzeptiert?: 'Ja' | 'Nein' | 'nicht notwendig';
    partner?: boolean;
    suchauftrag?: string[]; 
    budget?: string;
    rendite?: string;
    risiko?: 'riskant' | 'solide' | 'sicher';
  };
  // Zusatzinfos für Tippgeber:
  tippgeberDaten?: {
    formularErhalten?: 'Ja' | 'Nein';
    richtlinienAkzeptiert?: 'Ja' | 'Nein';
    vermittelteImmobilie?: string; // Immobilien-IDs oder Bezeichnung
    statusAuftrag?:'offen' | 'abgeschlossen' | 'fruchtlos';
    geberVertrag?: 'Ja' | 'Nein';
    vereinbarteProvision?: string;
    geldErhalten?: 'Ja' | 'Nein';
  };
  // Allgemeine Anmerkungen:
  notizen?: string;
  letzterKontakt?: Date;
  nächsterTermin?: Date;
  bevorzugtesMedium?: 'Telefon/Handy' | 'E-Mail' | 'Postalisch' | 'Persönlich';
  sprechzeiten?: string;
  beruf?: string;
  createdAt: string; // Erstellungsdatum (ISO-String)
  updatedAt?: string; // Letzte Aktualisierung (ISO-String)
}
