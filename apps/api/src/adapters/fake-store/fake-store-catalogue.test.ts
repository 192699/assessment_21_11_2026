import { describe, expect, it } from "vitest";
import { mapFakeStoreProduct } from "./fake-store-catalogue";

describe("Fake Store mapping", () => {
  it("maps upstream fields onto the catalogue product contract", () => {
    const product = mapFakeStoreProduct({
      id: 12,
      title: " WD Drive ",
      price: 114,
      description: "Expand your console storage",
      category: "electronics",
      image: "https://example.com/drive.png",
      rating: { rate: 4.8, count: 400 },
    });

    expect(product).toEqual({
      id: "12",
      title: "WD Drive",
      description: "Expand your console storage",
      price: { amount: 114, currency: "USD" },
      category: { id: "electronics", name: "electronics" },
      imageUrl: "https://example.com/drive.png",
      rating: { score: 4.8, count: 400 },
    });
  });
});
