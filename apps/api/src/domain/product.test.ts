import { describe, expect, it } from "vitest";
import {
  categoryIdFromName,
  matchesSearch,
  searchProducts,
  splitCategoryProducts,
  takeFeatured,
  type Product,
} from "./product";

function product(overrides: Partial<Product> & Pick<Product, "id" | "title">): Product {
  return {
    description: "A useful item",
    price: { amount: 10, currency: "USD" },
    category: { id: "electronics", name: "electronics" },
    imageUrl: "https://example.com/p.png",
    rating: { score: 4, count: 10 },
    ...overrides,
  };
}

describe("ranking and search", () => {
  const catalogue = [
    product({ id: "1", title: "Budget cable", rating: { score: 4.8, count: 20 } }),
    product({ id: "2", title: "Gold monitor", rating: { score: 4.8, count: 400 } }),
    product({ id: "3", title: "Travel backpack", rating: { score: 3.9, count: 120 } }),
    product({
      id: "4",
      title: "Quiet jacket",
      category: { id: "mens-clothing", name: "men's clothing" },
      rating: { score: 4.7, count: 500 },
    }),
    product({ id: "5", title: "SSD drive", rating: { score: 2.9, count: 470 } }),
    product({ id: "6", title: "Gaming drive", rating: { score: 4.9, count: 12 } }),
  ];

  it("takes the five highest rated products, using review count to break ties", () => {
    const featured = takeFeatured(catalogue, 5).map((item) => item.id);
    expect(featured).toEqual(["6", "2", "1", "4", "3"]);
  });

  it("splits a category into a top-rated slice and the remaining products", () => {
    const electronics = catalogue.filter((item) => item.category.id === "electronics");
    const { featured, additional } = splitCategoryProducts(electronics, 3);
    expect(featured.map((item) => item.id)).toEqual(["6", "2", "1"]);
    expect(additional.map((item) => item.id)).toEqual(["3", "5"]);
  });

  it("matches title, description, and category text", () => {
    expect(matchesSearch(catalogue[3], "jacket")).toBe(true);
    expect(matchesSearch(catalogue[3], "men's")).toBe(true);
    expect(matchesSearch(catalogue[0], "useful")).toBe(true);
    expect(matchesSearch(catalogue[0], "banana")).toBe(false);
  });

  it("ignores blank search terms", () => {
    expect(searchProducts(catalogue, "   ")).toEqual([]);
  });

  it("slugifies category names without punctuation", () => {
    expect(categoryIdFromName("men's clothing")).toBe("mens-clothing");
    expect(categoryIdFromName("Women's Clothing")).toBe("womens-clothing");
  });
});
