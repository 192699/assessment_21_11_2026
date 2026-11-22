export type Product = {
  id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currency: "USD";
  };
  category: {
    id: string;
    name: string;
  };
  imageUrl: string;
  rating: {
    score: number;
    count: number;
  };
};

export type Category = {
  id: string;
  name: string;
};

export function categoryIdFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function rankByRating(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    if (b.rating.score !== a.rating.score) {
      return b.rating.score - a.rating.score;
    }
    return b.rating.count - a.rating.count;
  });
}

export function takeFeatured(products: Product[], count: number): Product[] {
  return rankByRating(products).slice(0, count);
}

export function splitCategoryProducts(
  products: Product[],
  featuredCount: number
): { featured: Product[]; additional: Product[] } {
  const ranked = rankByRating(products);
  return {
    featured: ranked.slice(0, featuredCount),
    additional: ranked.slice(featuredCount),
  };
}

export function matchesSearch(product: Product, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return false;
  }

  return [product.title, product.description, product.category.name].some((field) =>
    field.toLowerCase().includes(query)
  );
}

export function searchProducts(products: Product[], query: string): Product[] {
  return rankByRating(products.filter((product) => matchesSearch(product, query)));
}
