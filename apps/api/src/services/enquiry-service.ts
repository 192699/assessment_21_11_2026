import type { EnquiryInput } from "../domain/enquiry";
import type { Product } from "../domain/product";
import type { EmailSender } from "../ports/email-sender";
import type { ProductCatalogue } from "../ports/product-catalogue";

export class UnknownProductError extends Error {
  constructor(productId: string) {
    super(`Unknown product: ${productId}`);
    this.name = "UnknownProductError";
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export class EnquiryService {
  constructor(
    private readonly catalogue: ProductCatalogue,
    private readonly emailSender: EmailSender,
    private readonly salesInbox: string,
    private readonly fromEmail: string
  ) {}

  async submit(input: EnquiryInput): Promise<void> {
    const product = await this.catalogue.getProduct(input.productId);
    if (!product) {
      throw new UnknownProductError(input.productId);
    }

    const text = this.buildText(input, product);
    const html = this.buildHtml(input, product);

    await this.emailSender.send({
      to: this.salesInbox,
      from: this.fromEmail,
      subject: `Enquiry: ${product.title}`,
      text,
      html,
    });
  }

  private buildText(input: EnquiryInput, product: Product): string {
    return [
      `New catalogue enquiry`,
      ``,
      `Product: ${product.title} (id ${product.id})`,
      `Category: ${product.category.name}`,
      `Price: ${product.price.currency} ${product.price.amount}`,
      ``,
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone ?? "not provided"}`,
      ``,
      `Message:`,
      input.message,
    ].join("\n");
  }

  private buildHtml(input: EnquiryInput, product: Product): string {
    return `
      <h1>New catalogue enquiry</h1>
      <p><strong>Product:</strong> ${escapeHtml(product.title)} (id ${escapeHtml(product.id)})</p>
      <p><strong>Category:</strong> ${escapeHtml(product.category.name)}</p>
      <p><strong>Price:</strong> ${product.price.currency} ${product.price.amount}</p>
      <hr />
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(input.phone ?? "not provided")}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(input.message).replaceAll("\n", "<br />")}</p>
    `;
  }
}
