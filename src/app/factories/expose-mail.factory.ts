import { ExposeAnfrageDto } from '../models/expose-anfrage.model';
import { Immobilie } from '../models/immobilie.model';
import { mapMarketingType } from './marketing-type.util';

export function createExposeAnswerMailPayload(
  anfrage: ExposeAnfrageDto,
  immobilie: Immobilie
) {
  return {
    email: anfrage.email,
    externalId: anfrage.requestPropertyId,
    lastName: anfrage.lastName,
    salutation: anfrage.salutation,
    numberOfRooms: immobilie?.numberOfRooms || '',
    city: immobilie?.city || '',
    value: immobilie?.value || 0,
    marketingType: mapMarketingType(immobilie?.marketingType || ''),
    immobilienTyp: immobilie?.propertyType || '',
    exposePdfUrl: immobilie?.exposePdfUrl || '',
  };
}
