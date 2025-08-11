// wird bei jeder Anfrage erstellt. Stellt Geflecht zwischen Interessent und Immobilie dar
// Dient als Protokoll um die Übersicht zu behalten und Infos zum aktuellen Status des Interessenten zu erhalten

export interface PropertyInquiryProcess {
  inquiryProcessId: string; // ist gleichzeitig die docId
  customerId: string;
  propertyExternalId: string;

  // Die drei Ids bilden zusamemn den sicheren Token, um das individuelle Exposé für den Kunden anzuzeigen (weil ja jedes unterschiedlich weit freigeschaltet sein wird)

  exposeAccessLevel: 'normal' | 'gekürzt' | 'erweitert';
  // die Online Version in ImmoScout und HP ist normal, d.h. ganz kurz
  // gekürzt, wenn Kunde die Richtlinien bestätigt hat
  // erweitert wird sein, wenn der Kunde bereits besichtigt hat, dann erhält er Links zu Unterlagen und mehrere Fotos usw.

  inquiryProcessStatus: InquiryProcessStatus; // ausgelagert als enum type
  protocolNotes?: string; // wichtig, z.B. Grund falls Interessent kein Interesse mehr hat oder wenn Interessent Fragen hat zur Immobilie

  // relevant für Exposes.
  requestMessage?: string; // Message vom Exposé-Anfrage Formular
  exposeSent?: Date | null; // Wann ging das Exposé raus, i.d.R. creationDate (muss aber nicht).

  // Eigentlich Bedingung beim Exposé-Anfrage Formular
  acceptedTermsAt?: Date;
  acceptedWithdrawalAt?: Date;
  acceptedPrivacyAt?: Date;

  // relevant für Besichtigungen
  viewingAppointments?: ViewingAppointment[]; // Kunde kann mehrere Besichtigungen machen. Eigenes Interface beachten.
  objectProof?: Date; // Wann wurde der Objektnachweis unterschrieben eingereicht. Wichtig für mich zu wissen. Braucht Kunde nur einmal.

  // relevant für nach der Erstbesichtigung
  giveDocuments: boolean; // wenn Kunde berechtigt sein soll, weitere Unterlagen zum Objekt zu bekommmen
  rejectionReasons: string; // Aussagen von Kunden, warum sie ablehnen

  // relevant für Finanzierungsphase
  kindOfFinance: 'keine Angabe' | 'Bank' | 'Finanzberater' | 'selbst';
  CooperationWithFSK: boolean; // für mich interessant, ob Kunde sich bei FSK Finanzierungsberater gemeldet hatte - wegen Tippgeberprovisionsansprüchen
  fundedSum: number; // mögliche Finanzierungshöhe, die der Kunde von der Bank gesagt bekommen hat
  bankConfirmation: boolean; // Bankbestätigung vom Kunden erhalten
  selfDisclosureSent?: Date; // Datum wann ich die Selbstauskunft gesendet habe
  selfDisclosure: boolean; // ausgefüllte und unterzeichnete Selbstauskunft erhalten
  schufaScore?: Date; // Datum wann ich die Schufa Auskunft erhalten habe

  // relevant für Verhandlungsphase
  purchaseOffers?: PurchaseOffer[]; // Kunde kann mehrere Agebote machen. Eigenes Interface beachten.
  finalPurchasePrice?: number; // Finaler Verkaufspreis
  confirmationFinalPriceToOwnerSent: boolean; // ob die Bitte zum Bestätigung Finaler Verkaufspreis an Eigentümer rausging
  confirmationFinalPriceByOwner?: Date; // Wann finaler Verkaufspreis vom Eigentümer akzeptiert wurde

  // relevant für Kaufvorbereitung
  copyOfIDCardReceived: boolean; // vom Käufer Personalausweiskopie erhalten

  notaryAppointmentDate?: Date; // Notartermin
  handoverType?: 'Übergabetermin' | 'mit Kaufpreis'; // entweder Übergabe oder Kaufpreiszahlung
  handoverDate?: Date; // Übergabetermin (so oder so, denn wenn "mit Kaufpreis" dann wird der Termin auch irgendwann gemacht, nur später)

  // Was sonst wichtig ist
  feedbackLinkSent: boolean; // Kunden aufgefordert mich zu bewerten (kostenfrei)
  feedbackLinkWithCouponSent: boolean; // Kunden aufgefordert mich zu bewerten (mit Aussicht auf Gutschein)
  sharingCommissionLinkSent: boolean; // Kunden Einladung gesendet, Tippgeber zu sein

  creationDate?: Date; // Wann wurde die Anfrage des Interessenten gestellt
  lastUpdateDate?: Date;
  historyLog?: LogEntry[]; // logbuch um nachzuverfolgen was zuletzt passiert ist
}

export type InquiryProcessStatus =
  | 'Ausgeschieden'
  | 'Anfrage'
  | 'Exposé'
  | 'Besichtigung'
  | 'Starkes Interesse'
  | 'Finanzierung'
  | 'Verhandlung'
  | 'Kaufvorbereitung'
  | 'Notarielle Abwicklung'
  | 'Übergabe'
  | 'Abgeschlossen';

export interface ViewingAppointment {
  viewingType:
    | 'Erstbesichtigung'
    | 'Zweitbesichtigung'
    | 'Drittbesichtigung'
    | 'Gutachterbegehung';
  viewingDate?: Date;
  confirmationSent?: Date;
  confirmed: boolean;
  canceled: boolean;
  cancellationReason?: string;
  notes?: string;
  viewingConfirmationId?: string;
}

export interface PurchaseOffer {
  offerDate: Date;
  offerMedium: 'mail' | 'telefonisch' | 'mündlich/persönlich' | 'postalisch';
  offerSum: number; // Höhe des Angebots
  offerText?: string; // Text
  canceled?: boolean; // ANgebot zurückgenommmen
  cancellationReason?: string; // Grund für Rücknahme
  confirmed: boolean; // bestätigt (nicht angenommen)
  forwarded?: Date; // wann an Eigentümer weitergeleitet
  accepted: boolean; // Angebot angenommen
}

// Für bessere Übersicht, was zuletzt passiert ist eiin Logeintrag Interface
export interface LogEntry {
  date: Date; // Wann die Aktion passiert ist
  user: string; // Wer sie ausgelöst hat (z. B. Admin-Mail, ID oder "System")
  action: string; // Was gemacht wurde, z. B. "Besichtigung bestätigt"
  comment?: string; // Optionale Anmerkung, z. B. "Kunde hat telefonisch zugesagt"
}
