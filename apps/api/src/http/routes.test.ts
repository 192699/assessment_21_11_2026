import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { loadConfig } from "../config";
import type { Product } from "../domain/product";
import type { EmailSender, SalesEnquiryEmail } from "../ports/email-sender";
import type { ProductCatalogue } from "../ports/product-catalogue";

const products: Product[] = [
  {
    id: "11",
    title: "Silicon Power SSD",
    description: "Fast internal drive",
    price: { amount: 109, currency: "USD" },
    category: { id: "electronics", name: "electronics" },
    imageUrl: "https://example.com/ssd.png",
    rating: { score: 4.8, count: 319 },
  },
  {
    id: "3",
    title: "Cotton Jacket",
    description: "Warm outerwear",
    price: { amount: 55.99, currency: "USD" },
    category: { id: "mens-clothing", name: "men's clothing" },
    imageUrl: "https://example.com/jacket.png",
    rating: { score: 4.7, count: 500 },
  },
];

class MemoryCatalogue implements ProductCatalogue {
  async listProducts() {
    return products;
  }
  async getProduct(id: string) {
    return products.find((product) => product.id === id) ?? null;
  }
  async listCategories() {
    return [
      { id: "electronics", name: "electronics" },
      { id: "mens-clothing", name: "men's clothing" },
    ];
  }
}

class MemoryEmail implements EmailSender {
  sent: SalesEnquiryEmail[] = [];
  async send(email: SalesEnquiryEmail) {
    this.sent.push(email);
  }
}

function testApp(email = new MemoryEmail()) {
  const app = createApp({
    config: loadConfig({
      FEATURED_COUNT: "5",
      CATEGORY_FEATURED_COUNT: "3",
      SALES_INBOX: "sales@example.com",
      FROM_EMAIL: "catalogue@example.com",
      WEB_ORIGIN: "http://localhost:5173",
    }),
    catalogue: new MemoryCatalogue(),
    emailSender: email,
  });
  return { app, email };
}

describe("HTTP critical path", () => {
  it("returns featured products for the home page", async () => {
    const { app } = testApp();
    const response = await request(app).get("/api/catalogue/featured");
    expect(response.status).toBe(200);
    expect(response.body.products).toHaveLength(2);
    expect(response.body.products[0].id).toBe("11");
  });

  it("returns top-rated and additional products for a category", async () => {
    const { app } = testApp();
    const response = await request(app).get("/api/categories/electronics");
    expect(response.status).toBe(200);
    expect(response.body.featured[0].title).toBe("Silicon Power SSD");
    expect(response.body.additional).toEqual([]);
  });

  it("filters search results by the submitted term", async () => {
    const { app } = testApp();
    const response = await request(app).get("/api/products/search").query({ q: "jacket" });
    expect(response.status).toBe(200);
    expect(response.body.products.map((product: Product) => product.id)).toEqual(["3"]);
  });

  it("returns a product detail payload", async () => {
    const { app } = testApp();
    const response = await request(app).get("/api/products/11");
    expect(response.status).toBe(200);
    expect(response.body.product.title).toBe("Silicon Power SSD");
  });

  it("sends an enquiry email for a known product", async () => {
    const { app, email } = testApp();
    const response = await request(app).post("/api/enquiries").send({
      productId: "11",
      name: "Alex Buyer",
      email: "alex@example.com",
      phone: "020 0000 0000",
      message: "Can you supply ten units next month?",
    });

    expect(response.status).toBe(201);
    expect(email.sent).toHaveLength(1);
    expect(email.sent[0].to).toBe("sales@example.com");
    expect(email.sent[0].subject).toContain("Silicon Power SSD");
    expect(email.sent[0].text).toContain("alex@example.com");
  });

  it("rejects an enquiry with a short message", async () => {
    const { app, email } = testApp();
    const response = await request(app).post("/api/enquiries").send({
      productId: "11",
      name: "Al",
      email: "not-an-email",
      message: "Hi",
    });

    expect(response.status).toBe(400);
    expect(email.sent).toHaveLength(0);
  });
});
