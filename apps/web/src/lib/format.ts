import type { Product } from "../types";

export function formatPrice(product: Product): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: product.price.currency,
  }).format(product.price.amount);
}

export function formatRating(product: Product): string {
  return `${product.rating.score.toFixed(1)} · ${product.rating.count} reviews`;
}

export function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
