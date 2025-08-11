export interface ViewingConfirmation {
  viewingConfirmationId: string; // einmalige Id = "{customerId}_{propertyExternalId}_{timestamp vom erstellten Termin}"
  customerId?: string;
  propertyExternalId?: string;
  inquiryProcessId: string; // = "{customerId}_{propertyExternalId}"

  // von customer
  salutation?: string;
  firstName?: string;
  lastName?: string;

  // mit interface ViewingAppointment identisch
  viewingType?: string;
  viewingDate?: Date;

  // von immobilie
  title: string;
  street: string;
  houseNumber: string;
  postcode: string;
  city: string;

  // Link sperren (falls nötig)
  blocked?: boolean;

  // Meta
  creationDate?: string;
  sentMailConfirmation?: any;    // Timestamp | null  ⬅️ NEU

  // Vom Kunden gesetzt
  acceptedConditions?: boolean; // ⬅️ existiert ab Start
  confirmedAt?: any;            // Timestamp | null
  confirmUa?: string | null;    // User-Agent | null
  note?: string | null;         // optional
}
