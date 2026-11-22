import type { Category, EnquiryPayload, Product } from "../types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;

  if (!response.ok) {
    throw new Error(body.error ?? `Request failed (${response.status})`);
  }

  return body;
}

export const api = {
  featured: () => request<{ products: Product[] }>("/api/catalogue/featured"),
  categories: () => request<{ categories: Category[] }>("/api/categories"),
  category: (id: string) =>
    request<{ category: Category; featured: Product[]; additional: Product[] }>(
      `/api/categories/${id}`
    ),
  search: (query: string) =>
    request<{ query: string; products: Product[] }>(
      `/api/products/search?q=${encodeURIComponent(query)}`
    ),
  product: (id: string) => request<{ product: Product }>(`/api/products/${id}`),
  enquire: (payload: EnquiryPayload) =>
    request<{ ok: true }>("/api/enquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
