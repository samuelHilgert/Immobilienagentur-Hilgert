import { prospectiveBuyer } from "./prospectiveBuyer.model";

export enum CustomerRole {
  Interessent = 'Interessent',
  Suchend = 'Suchend',
  Eigentümer = 'Eigentümer',
  Vertretung = 'Vertretung',
  Käufer = 'Käufer',
  Verkäufer = 'Verkäufer',
  Mieter = 'Mieter',
  Firma = 'Firma',
  Großanleger = 'Großanleger',
  Kleinanleger = 'Kleinanleger',
  Tippgeber = 'Tippgeber',
  Feedbackformular = 'Feedbackformular',
  Kontaktformular = 'Kontaktformular',
  Sonstige = 'Sonstige',
}

export enum CreationSource {
  ExposeAnfrage = 'Expose-Anfrage',
  Kontaktformular = 'Kontaktformular',
  Feedbackformular = 'Feedbackformular',
  Manuell = 'Manuell',
  Sonstiges = 'Sonstiges',
}

export interface Customer {
  customerId: string;

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
  mobile: string;

  birthday: string;
  profession: string;

  roles: CustomerRole[];

  source: CreationSource;
  creationDate: string;
  lastModificationDate: string;

  buyerData?: prospectiveBuyer;
}
