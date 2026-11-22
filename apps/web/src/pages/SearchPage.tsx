import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { ProductGrid } from "../components/ProductGrid";
import { SearchBar } from "../components/SearchBar";
import { Status } from "../components/Status";
import { useAsync } from "../hooks/useAsync";

export function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = (params.get("q") ?? "").trim();
  const { data, error, loading } = useAsync(`search:${query}`, () => {
    if (!query) {
      return Promise.resolve({ query: "", products: [] });
    }
    return api.search(query);
  });

  return (
    <section>
      <p className="eyebrow">Search</p>
      <h1>{query ? `Results for “${query}”` : "Search the catalogue"}</h1>
      <SearchBar
        key={query}
        initialQuery={query}
        onSearch={(next) => navigate(`/search?q=${encodeURIComponent(next)}`)}
      />
      <Status
        loading={Boolean(query) && loading}
        error={error}
        empty={
          query && data && data.products.length === 0
            ? "No products match that search term."
            : !query
              ? "Enter a search term and click Search."
              : null
        }
      />
      {data && data.products.length > 0 && <ProductGrid products={data.products} />}
    </section>
  );
}
