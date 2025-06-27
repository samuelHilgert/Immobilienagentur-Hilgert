import { PropertyInquiryProcess } from '../models/property-inquiry-process.model';
import { ExposeAnfrageDto } from '../models/expose-anfrage.model';
import { createLogEntry } from '../utils/log-entry.util';

export function createInitialInquiryProcess(
  anfrage: ExposeAnfrageDto,
  inquiryProcessId: string
): PropertyInquiryProcess {
  return {
    inquiryProcessId,
    customerId: anfrage.requestCustomerId,
    propertyExternalId: anfrage.requestPropertyId,
    exposeAccessLevel: 'normal',
    inquiryProcessStatus: 'Anfrage',
    rejectionReasons: '',
    requestMessage: anfrage.message,
    exposeSent: null,
    acceptedTermsAt: new Date(),
    acceptedWithdrawalAt: new Date(),
    acceptedPrivacyAt: new Date(),
    giveDocuments: false,
    kindOfFinance: 'keine Angabe',
    CooperationWithFSK: false,
    fundedSum: 0,
    bankConfirmation: false,
    selfDisclosure: false,
    confirmationFinalPriceToOwnerSent: false,
    copyOfIDCardReceived: false,
    feedbackLinkSent: false,
    feedbackLinkWithCouponSent: false,
    sharingCommissionLinkSent: false,
    creationDate: new Date(),
    lastUpdateDate: new Date(),
    historyLog: [
      createLogEntry(
        'Anfrage über Exposé-Formular eingegangen',
        anfrage.email,
        anfrage.message
      )
    ],
  };
}
