// ✅ NEUES INTERFACE für Bewertungen
export interface Bewertung {
  bewertungId: string;
  quelle: {
    google: boolean;
    homepage: boolean;
    immoScout: boolean;
  };
  text: string;
  antwort?: string;
  rating: number;
  autorName: string;
  autorEmail: string;
  Customer?: Boolean;
  customerId?: string;
  creationDate: Date;
}
