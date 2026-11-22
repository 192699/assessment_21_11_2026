import type { Category, Product } from "../domain/product";

export interface ProductCatalogue {
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  listCategories(): Promise<Category[]>;
}

/**
 * Thrown by any ProductCatalogue adapter when its data source cannot be reached
 * or returns an unusable response. Part of the port contract so the HTTP layer
 * can map it to 503 without knowing which adapter is in use.
 */
export class CatalogueUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogueUnavailableError";
  }
}
