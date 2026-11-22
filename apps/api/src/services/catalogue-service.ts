import {
  searchProducts,
  splitCategoryProducts,
  takeFeatured,
  type Category,
  type Product,
} from "../domain/product";
import type { ProductCatalogue } from "../ports/product-catalogue";

export class CatalogueService {
  constructor(
    private readonly catalogue: ProductCatalogue,
    private readonly featuredCount: number,
    private readonly categoryFeaturedCount: number
  ) {}

  featured(): Promise<Product[]> {
    return this.catalogue.listProducts().then((products) =>
      takeFeatured(products, this.featuredCount)
    );
  }

  categories(): Promise<Category[]> {
    return this.catalogue.listCategories();
  }

  async category(categoryId: string): Promise<{
    category: Category;
    featured: Product[];
    additional: Product[];
  } | null> {
    const [categories, products] = await Promise.all([
      this.catalogue.listCategories(),
      this.catalogue.listProducts(),
    ]);
    const category = categories.find((item) => item.id === categoryId);
    if (!category) {
      return null;
    }

    const inCategory = products.filter(
      (product) => product.category.id === categoryId
    );
    return {
      category,
      ...splitCategoryProducts(inCategory, this.categoryFeaturedCount),
    };
  }

  async search(query: string): Promise<Product[]> {
    const products = await this.catalogue.listProducts();
    return searchProducts(products, query);
  }

  product(id: string): Promise<Product | null> {
    return this.catalogue.getProduct(id);
  }
}
