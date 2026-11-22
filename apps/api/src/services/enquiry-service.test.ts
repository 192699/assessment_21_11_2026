import { describe, expect, it } from "vitest";
import type { Product } from "../domain/product";
import type { EmailSender, SalesEnquiryEmail } from "../ports/email-sender";
import type { ProductCatalogue } from "../ports/product-catalogue";
import { EnquiryService, UnknownProductError } from "./enquiry-service";

const product: Product = {
  id: "7",
  title: "White Gold Ring",
  description: "A ring",
  price: { amount: 9.99, currency: "USD" },
  category: { id: "jewelery", name: "jewelery" },
  imageUrl: "https://example.com/ring.png",
  rating: { score: 3, count: 400 },
};

const catalogue: ProductCatalogue = {
  listProducts: async () => [product],
  getProduct: async (id) => (id === product.id ? product : null),
  listCategories: async () => [product.category],
};

class MemoryEmail implements EmailSender {
  sent: SalesEnquiryEmail[] = [];
  async send(email: SalesEnquiryEmail) {
    this.sent.push(email);
  }
}

function service(email = new MemoryEmail()) {
  return {
    email,
    enquiries: new EnquiryService(catalogue, email, "sales@example.com", "shop@example.com"),
  };
}

describe("EnquiryService", () => {
  it("emails the sales inbox with product and contact details", async () => {
    const { email, enquiries } = service();
    await enquiries.submit({
      productId: "7",
      name: "Sam Lee",
      email: "sam@example.com",
      message: "Do you ship to Ireland?",
    });

    expect(email.sent).toHaveLength(1);
    const [sent] = email.sent;
    expect(sent.to).toBe("sales@example.com");
    expect(sent.from).toBe("shop@example.com");
    expect(sent.subject).toBe("Enquiry: White Gold Ring");
    expect(sent.text).toContain("Phone: not provided");
    expect(sent.text).toContain("Do you ship to Ireland?");
  });

  it("escapes customer input in the HTML body", async () => {
    const { email, enquiries } = service();
    await enquiries.submit({
      productId: "7",
      name: "<script>alert(1)</script>",
      email: "sam@example.com",
      message: "Hello <b>sales</b> & team",
    });

    const html = email.sent[0].html;
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Hello &lt;b&gt;sales&lt;/b&gt; &amp; team");
  });

  it("rejects enquiries for unknown products without sending email", async () => {
    const { email, enquiries } = service();
    await expect(
      enquiries.submit({
        productId: "999",
        name: "Sam Lee",
        email: "sam@example.com",
        message: "Is this in stock?",
      })
    ).rejects.toBeInstanceOf(UnknownProductError);
    expect(email.sent).toHaveLength(0);
  });
});
