export interface KontaktAnfrage {
  contactCustomerId: string;

  salutation: string;
  company?: string;

  firstName: string;
  lastName: string;

  email: string;
  phone: string;

  subject: string;
  message: string;

  acceptedPrivacy: boolean;
  creationDate?: string;
}
