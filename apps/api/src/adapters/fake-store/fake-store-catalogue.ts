import {
  categoryIdFromName,
  type Category,
  type Product,
} from "../../domain/product";
import type { ProductCatalogue } from "../../ports/product-catalogue";

type FakeStoreProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
};

export class UpstreamUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UpstreamUnavailableError";
  }
}

export class FakeStoreCatalogue implements ProductCatalogue {
  private cache:
    | {
        expiresAt: number;
        products: Product[];
      }
    | null = null;

  constructor(
    private readonly baseUrl: string,
    private readonly ttlMs: number,
    private readonly fetchFn: typeof fetch = fetch
  ) {}

  async listProducts(): Promise<Product[]> {
    return this.loadProducts();
  }

  async getProduct(id: string): Promise<Product | null> {
    const products = await this.loadProducts();
    return products.find((product) => product.id === id) ?? null;
  }

  async listCategories(): Promise<Category[]> {
    const products = await this.loadProducts();
    const unique = new Map<string, Category>();
    for (const product of products) {
      unique.set(product.category.id, product.category);
    }
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  private async loadProducts(): Promise<Product[]> {
    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return this.cache.products;
    }

    const response = await this.fetchFn(`${this.baseUrl}/products`, {
      signal: AbortSignal.timeout(8000),
    }).catch((error: unknown) => {
      throw new UpstreamUnavailableError(
        error instanceof Error ? error.message : "Product source request failed"
      );
    });

    if (!response.ok) {
      throw new UpstreamUnavailableError(
        `Product source returned ${response.status}`
      );
    }

    const payload = (await response.json()) as FakeStoreProduct[];
    const products = payload.map(mapFakeStoreProduct);
    this.cache = { products, expiresAt: now + this.ttlMs };
    return products;
  }
}

export function mapFakeStoreProduct(raw: FakeStoreProduct): Product {
  return {
    id: String(raw.id),
    title: raw.title.trim(),
    description: raw.description,
    price: {
      amount: raw.price,
      currency: "USD",
    },
    category: {
      id: categoryIdFromName(raw.category),
      name: raw.category,
    },
    imageUrl: raw.image,
    rating: {
      score: raw.rating?.rate ?? 0,
      count: raw.rating?.count ?? 0,
    },
  };
}
