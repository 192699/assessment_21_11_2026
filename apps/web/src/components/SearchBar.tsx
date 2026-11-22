import { FormEvent, useState } from "react";

type Props = {
  id?: string;
  initialQuery?: string;
  onSearch: (query: string) => void;
};

export function SearchBar({ id = "catalogue-search", initialQuery = "", onSearch }: Props) {
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSearch(query.trim());
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label className="sr-only" htmlFor={id}>
        Search products
      </label>
      <input
        id={id}
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products"
      />
      <button type="submit">Search</button>
    </form>
  );
}
