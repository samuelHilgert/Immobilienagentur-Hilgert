export interface KontaktAnfrage {
  customerId: string;
  indexId: number;
  salutation: string;
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone: string;
  mobile: string;
  subject: string;
  message: string;
  acceptedPrivacy: boolean;
  creationDate?: string;
}
