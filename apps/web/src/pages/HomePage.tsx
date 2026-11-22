import { api } from "../api/client";
import { ProductGrid } from "../components/ProductGrid";
import { Status } from "../components/Status";
import { useAsync } from "../hooks/useAsync";

export function HomePage() {
  const { data, error, loading } = useAsync("featured", () => api.featured());

  return (
    <section>
      <p className="eyebrow">This season</p>
      <h1>Top rated picks</h1>
      <p className="lede">
        Five products with the strongest ratings from the current catalogue.
      </p>
      <Status loading={loading} error={error} />
      {data && <ProductGrid products={data.products} />}
    </section>
  );
}
