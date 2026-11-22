import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAsync } from "../hooks/useAsync";

export function ThankYouPage() {
  const [params] = useSearchParams();
  const productId = params.get("product") ?? "";
  const { data } = useAsync(`thanks:${productId}`, () => {
    if (!productId) {
      return Promise.resolve(null);
    }
    return api.product(productId).catch(() => null);
  });

  return (
    <section className="thank-you">
      <p className="eyebrow">Enquiry sent</p>
      <h1>Thank you</h1>
      <p className="lede">
        Your enquiry
        {data?.product ? ` about ${data.product.title}` : ""} has been sent to our sales inbox.
        Someone will follow up using the contact details you provided.
      </p>
      <Link className="text-link" to="/">
        Back to featured products
      </Link>
    </section>
  );
}
