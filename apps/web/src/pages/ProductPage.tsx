import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { EnquiryForm } from "../components/EnquiryForm";
import { Status } from "../components/Status";
import { useAsync } from "../hooks/useAsync";
import { formatPrice, formatRating, titleCase } from "../lib/format";
import type { EnquiryPayload } from "../types";

export function ProductPage() {
  const { productId = "" } = useParams();
  const navigate = useNavigate();
  const { data, error, loading } = useAsync(`product:${productId}`, () =>
    api.product(productId)
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function onEnquire(payload: EnquiryPayload) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.enquire(payload);
      navigate(`/enquiry/thank-you?product=${encodeURIComponent(payload.productId)}`);
    } catch (reason: unknown) {
      setSubmitError(reason instanceof Error ? reason.message : "Could not send enquiry");
    } finally {
      setSubmitting(false);
    }
  }

  const product = data?.product;

  return (
    <section>
      <Status loading={loading} error={error} />
      {product && (
        <div className="product-detail">
          <div className="product-detail-image">
            <img src={product.imageUrl} alt={product.title} />
          </div>
          <div>
            <p className="eyebrow">
              <Link to={`/categories/${product.category.id}`}>
                {titleCase(product.category.name)}
              </Link>
            </p>
            <h1>{product.title}</h1>
            <p className="meta">{formatRating(product)}</p>
            <p className="price">{formatPrice(product)}</p>
            <p className="description">{product.description}</p>
            <EnquiryForm
              productId={product.id}
              submitting={submitting}
              error={submitError}
              onSubmit={onEnquire}
            />
          </div>
        </div>
      )}
    </section>
  );
}
