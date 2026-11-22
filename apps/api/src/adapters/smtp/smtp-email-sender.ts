import nodemailer from "nodemailer";
import type { EmailSender, SalesEnquiryEmail } from "../../ports/email-sender";

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
    await this.transport.sendMail({
      to: email.to,
      from: email.from,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
  }
}
