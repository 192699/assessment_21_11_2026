import { Link } from "react-router-dom";
import { formatPrice, formatRating } from "../lib/format";
import type { Product } from "../types";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  return (
    <Link className="product-card" to={`/products/${product.id}`}>
      <div className="product-card-image">
        <img src={product.imageUrl} alt={product.title} />
      </div>
      <div className="product-card-body">
        <p className="eyebrow">{product.category.name}</p>
        <h3>{product.title}</h3>
        <p className="meta">{formatRating(product)}</p>
        <p className="price">{formatPrice(product)}</p>
      </div>
    </Link>
  );
}
