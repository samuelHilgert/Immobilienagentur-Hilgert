export interface ExposeAnfrage {
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
    message: string;
    acceptedTerms: boolean;
    acceptedWithdrawal: boolean;
    acceptedPrivacy: boolean;
    immobilienId: string;
    immobilienTyp: string;
    creationDate?: string;
  }
  