import { Customer, CustomerRole, CreationSource } from '../models/customer.model';
import { ExposeAnfrageDto } from '../models/expose-anfrage.model';
import { prospectiveBuyer } from '../models/prospectiveBuyer.model';

export function createCustomerFromExposeAnfrage(
  anfrage: ExposeAnfrageDto,
  customerId: string
): Partial<Customer> {
  return {
    customerId,
    salutation: anfrage.salutation,
    company: anfrage.company,
    firstName: anfrage.firstName,
    lastName: anfrage.lastName,
    street: anfrage.street,
    houseNumber: anfrage.houseNumber,
    zip: anfrage.zip,
    city: anfrage.city,
    email: anfrage.email,
    phone: '',
    mobile: anfrage.phone,
    profession: '',
    birthday: '',
    roles: [CustomerRole.Interessent],
    source: CreationSource.ExposeAnfrage,
    creationDate: new Date().toISOString(),
    lastModificationDate: new Date().toISOString(),
    buyerData: {
      angefragteImmobilienIds: [anfrage.requestPropertyId],
    },
  };
}
