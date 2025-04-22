// ✅ NEUES INTERFACE für Feedbacks

export interface Feedback {
  bewertungId: string;
  feedbackCustomerId: string;
  publicAccepted: boolean;
  text: string;
  antwort?: string;
  rating: number;
  autorName: string;
  autorEmail: string;
  bonus?: string[];
  feedbackPaymentConditionAccepted: boolean;
  feedbackAdvertiseAccepted: boolean;
  creationDate?: string;
  lastModificationDate: string;
}
