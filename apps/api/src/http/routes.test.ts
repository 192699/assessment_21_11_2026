import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../app";
import { loadConfig } from "../config";
import type { Product } from "../domain/product";
import {
  EmailDeliveryError,
  type EmailSender,
  type SalesEnquiryEmail,
} from "../ports/email-sender";
import { CatalogueUnavailableError, type ProductCatalogue } from "../ports/product-catalogue";

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

function testApp<E extends EmailSender = MemoryEmail>(email: E = new MemoryEmail() as unknown as E) {
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
    expect(response.body.error).toBe("Validation failed");
    expect(email.sent).toHaveLength(0);
  });
});

describe("HTTP error handling", () => {
  const validEnquiry = {
    productId: "11",
    name: "Alex Buyer",
    email: "alex@example.com",
    message: "Can you supply ten units next month?",
  };

  it("rejects an empty search term", async () => {
    const { app } = testApp();
    const response = await request(app).get("/api/products/search").query({ q: "  " });
    expect(response.status).toBe(400);
  });

  it("returns 404 for an unknown category or product", async () => {
    const { app } = testApp();
    expect((await request(app).get("/api/categories/garden")).status).toBe(404);
    expect((await request(app).get("/api/products/999")).status).toBe(404);
  });

  it("returns 404 when enquiring about an unknown product", async () => {
    const { app, email } = testApp();
    const response = await request(app)
      .post("/api/enquiries")
      .send({ ...validEnquiry, productId: "999" });
    expect(response.status).toBe(404);
    expect(email.sent).toHaveLength(0);
  });

  it("returns 400 for a malformed JSON body", async () => {
    const { app } = testApp();
    const response = await request(app)
      .post("/api/enquiries")
      .set("Content-Type", "application/json")
      .send("{not json");
    expect(response.status).toBe(400);
  });

  it("returns 503 when the product source is unavailable", async () => {
    const app = createApp({
      config: loadConfig({}),
      catalogue: {
        listProducts: async () => {
          throw new CatalogueUnavailableError("down");
        },
        getProduct: async () => null,
        listCategories: async () => [],
      },
      emailSender: new MemoryEmail(),
    });
    const response = await request(app).get("/api/catalogue/featured");
    expect(response.status).toBe(503);
    expect(response.body.error).not.toContain("down");
  });

  it("returns 502 with a friendly message when email delivery fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const failing: EmailSender = {
      send: async () => {
        throw new EmailDeliveryError("ECONNREFUSED");
      },
    };
    const { app } = testApp(failing);
    const response = await request(app).post("/api/enquiries").send(validEnquiry);
    expect(response.status).toBe(502);
    expect(response.body.error).toMatch(/could not send your enquiry/i);
  });

  it("rate limits repeated enquiries from one client", async () => {
    const email = new MemoryEmail();
    const app = createApp({
      config: loadConfig({}),
      catalogue: new MemoryCatalogue(),
      emailSender: email,
      enquiryRateLimit: { windowMs: 60_000, max: 2 },
    });

    const statuses = [];
    for (let i = 0; i < 3; i += 1) {
      statuses.push((await request(app).post("/api/enquiries").send(validEnquiry)).status);
    }
    expect(statuses).toEqual([201, 201, 429]);
    expect(email.sent).toHaveLength(2);
  });
});

describe("config", () => {
  it("fails fast on a non-numeric count", () => {
    expect(() => loadConfig({ FEATURED_COUNT: "five" })).toThrow(/FEATURED_COUNT/);
  });
});
