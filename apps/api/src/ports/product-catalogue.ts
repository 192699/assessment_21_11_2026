import type { Category, Product } from "../domain/product";

export interface ProductCatalogue {
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  listCategories(): Promise<Category[]>;
}
