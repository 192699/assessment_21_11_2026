import { describe, expect, it, vi } from "vitest";
import { CatalogueUnavailableError } from "../../ports/product-catalogue";
import { FakeStoreCatalogue, mapFakeStoreProduct } from "./fake-store-catalogue";

const rawProducts = [
  {
    id: 1,
    title: "Backpack",
    price: 109.95,
    description: "Fits laptops",
    category: "men's clothing",
    image: "https://example.com/bag.png",
    rating: { rate: 3.9, count: 120 },
  },
  {
    id: 5,
    title: "Bracelet",
    price: 695,
    description: "Dragon design",
    category: "jewelery",
    image: "https://example.com/bracelet.png",
    rating: { rate: 4.6, count: 400 },
  },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

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

  it("defaults a missing rating to zero so ranking still works", () => {
    const { rating } = mapFakeStoreProduct({ ...rawProducts[0], rating: undefined });
    expect(rating).toEqual({ score: 0, count: 0 });
  });
});

describe("FakeStoreCatalogue adapter", () => {
  it("caches the product list within the TTL", async () => {
    const fetchFn = vi.fn(async () => jsonResponse(rawProducts));
    const catalogue = new FakeStoreCatalogue("https://store.test", 60_000, fetchFn);

    await catalogue.listProducts();
    await catalogue.getProduct("5");
    await catalogue.listCategories();

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledWith("https://store.test/products", expect.anything());
  });

  it("derives sorted, de-duplicated categories with slug ids", async () => {
    const catalogue = new FakeStoreCatalogue(
      "https://store.test",
      60_000,
      async () => jsonResponse([...rawProducts, { ...rawProducts[1], id: 6 }])
    );

    expect(await catalogue.listCategories()).toEqual([
      { id: "jewelery", name: "jewelery" },
      { id: "mens-clothing", name: "men's clothing" },
    ]);
  });

  it("returns null for an unknown product id", async () => {
    const catalogue = new FakeStoreCatalogue("https://store.test", 60_000, async () =>
      jsonResponse(rawProducts)
    );
    expect(await catalogue.getProduct("404")).toBeNull();
  });

  it("raises CatalogueUnavailableError when the source errors", async () => {
    const catalogue = new FakeStoreCatalogue("https://store.test", 60_000, async () =>
      jsonResponse({ message: "down" }, 500)
    );
    await expect(catalogue.listProducts()).rejects.toBeInstanceOf(CatalogueUnavailableError);
  });

  it("raises CatalogueUnavailableError when the network fails", async () => {
    const catalogue = new FakeStoreCatalogue("https://store.test", 60_000, async () => {
      throw new TypeError("fetch failed");
    });
    await expect(catalogue.listProducts()).rejects.toBeInstanceOf(CatalogueUnavailableError);
  });

  it("raises CatalogueUnavailableError on an unexpected payload shape", async () => {
    const catalogue = new FakeStoreCatalogue("https://store.test", 60_000, async () =>
      jsonResponse({ products: [] })
    );
    await expect(catalogue.listProducts()).rejects.toBeInstanceOf(CatalogueUnavailableError);
  });
});
