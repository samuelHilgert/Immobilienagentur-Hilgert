export interface ExposeAnfrageDto {
    requestCustomerId: string;
    
    salutation: string;
    company?: string;

    firstName: string;
    lastName: string;
    street: string;
    houseNumber: string;
    zip: string;
    city: string;

    email: string;
    phone: string;

    message: string;

    acceptedTerms: boolean;
    acceptedWithdrawal: boolean;
    acceptedPrivacy: boolean;

    requestPropertyId: string;
    
    creationDate?: string;
  }
  