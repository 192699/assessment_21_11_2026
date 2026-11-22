import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { ProductGrid } from "../components/ProductGrid";
import { Status } from "../components/Status";
import { useAsync } from "../hooks/useAsync";
import { titleCase } from "../lib/format";

export function CategoryPage() {
  const { categoryId = "" } = useParams();
  const { data, error, loading } = useAsync(`category:${categoryId}`, () =>
    api.category(categoryId)
  );

  return (
    <section>
      <p className="eyebrow">Category</p>
      <h1>{data ? titleCase(data.category.name) : "Loading"}</h1>
      <Status loading={loading} error={error} />
      {data && (
        <>
          <h2>Top rated in this category</h2>
          <ProductGrid products={data.featured} />
          <h2>Additional products</h2>
          {data.additional.length === 0 ? (
            <Status empty="No additional products in this category yet." />
          ) : (
            <ProductGrid products={data.additional} />
          )}
        </>
      )}
    </section>
  );
}
