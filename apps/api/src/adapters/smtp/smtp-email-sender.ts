import nodemailer from "nodemailer";
import {
  EmailDeliveryError,
  type EmailSender,
  type SalesEnquiryEmail,
} from "../../ports/email-sender";

export class SmtpEmailSender implements EmailSender {
  private readonly transport: nodemailer.Transporter;

  constructor(host: string, port: number) {
    this.transport = nodemailer.createTransport({
      host,
      port,
      secure: false,
    });
  }

  async send(email: SalesEnquiryEmail): Promise<void> {
    try {
      await this.transport.sendMail({
        to: email.to,
        from: email.from,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
    } catch (error: unknown) {
      throw new EmailDeliveryError(
        error instanceof Error ? error.message : "SMTP send failed"
      );
    }
  }
}
