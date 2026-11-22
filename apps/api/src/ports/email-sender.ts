export type SalesEnquiryEmail = {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
};

export interface EmailSender {
  send(email: SalesEnquiryEmail): Promise<void>;
}

/** Thrown by any EmailSender adapter when the provider rejects or cannot be reached. */
export class EmailDeliveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryError";
  }
}
