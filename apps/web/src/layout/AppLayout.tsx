import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { SearchBar } from "../components/SearchBar";
import { titleCase } from "../lib/format";
import type { Category } from "../types";

export function AppLayout() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api
      .categories()
      .then((payload) => setCategories(payload.categories))
      .catch(() => setCategories([]));
  }, []);

  function onSearch(term: string) {
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-row">
          <Link className="brand" to="/">
            Field &amp; Co.
          </Link>
          <SearchBar id="header-search" onSearch={onSearch} />
        </div>
        <nav className="category-nav" aria-label="Product categories">
          <NavLink to="/" end>
            Featured
          </NavLink>
          {categories.map((category) => (
            <NavLink key={category.id} to={`/categories/${category.id}`}>
              {titleCase(category.name)}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Proof of concept catalogue. Product data currently supplied via the API, not the browser.</p>
      </footer>
    </div>
  );
}
