export interface ExposeAnfrage {
    customerId: string;
    indexId: number; 
    salutation: string;
    firstName: string;
    lastName: string;
    street: string;
    houseNumber: string;
    zip: string;
    city: string;
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
  