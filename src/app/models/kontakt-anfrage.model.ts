export interface KontaktAnfrage {
    customerId: string;
    firstName: string;
    lastName: string;
    company?: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    acceptedPrivacy: boolean;
    creationDate?: string;
  }
  