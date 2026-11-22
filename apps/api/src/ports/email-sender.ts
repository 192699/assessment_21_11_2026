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
