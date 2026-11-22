import { FormEvent, useState } from "react";

type Props = {
  initialQuery?: string;
  onSearch: (query: string) => void;
};

export function SearchBar({ initialQuery = "", onSearch }: Props) {
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSearch(query.trim());
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label className="sr-only" htmlFor="catalogue-search">
        Search products
      </label>
      <input
        id="catalogue-search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search the catalogue"
      />
      <button type="submit">Search</button>
    </form>
  );
}
