import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import type { Product } from "./types";

/**
 * Acceptance-criteria walkthrough: real router, pages and components; only the
 * HTTP boundary (fetch to our own API) is stubbed.
 */

function product(id: string, title: string, categoryId = "electronics"): Product {
  return {
    id,
    title,
    description: `${title} description`,
    price: { amount: 10, currency: "USD" },
    category: { id: categoryId, name: categoryId },
    imageUrl: `https://example.com/${id}.png`,
    rating: { score: 4.5, count: 100 },
  };
}

const featured = ["1", "2", "3", "4", "5"].map((id) => product(id, `Featured ${id}`));
const ssd = product("11", "Silicon Power SSD");
const drive = product("12", "WD Gaming Drive");

type Call = { url: string; init?: RequestInit };
let calls: Call[];

function json(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

function fakeApi(url: string, init?: RequestInit) {
  calls.push({ url, init });
  const path = url.split("?")[0];
  if (path === "/api/catalogue/featured") return json({ products: featured });
  if (path === "/api/categories") {
    return json({ categories: [{ id: "electronics", name: "electronics" }] });
  }
  if (path === "/api/categories/electronics") {
    return json({
      category: { id: "electronics", name: "electronics" },
      featured: [ssd],
      additional: [drive],
    });
  }
  if (path === "/api/products/search") {
    const q = new URL(url, "http://x").searchParams.get("q");
    return json({ query: q, products: q === "ssd" ? [ssd] : [] });
  }
  if (path === "/api/products/11") return json({ product: ssd });
  if (path === "/api/enquiries") return json({ ok: true }, 201);
  return json({ error: "Not found" }, 404);
}

function renderAt(path: string) {
  return render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );
}

beforeEach(() => {
  calls = [];
  vi.stubGlobal("fetch", vi.fn(fakeApi));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("catalogue acceptance criteria", () => {
  it("home page shows the five featured products", async () => {
    renderAt("/");
    expect(await screen.findByText("Featured 1")).toBeInTheDocument();
    for (const item of featured) {
      expect(screen.getByRole("link", { name: new RegExp(item.title) })).toBeInTheDocument();
    }
  });

  it("category link shows top rated and additional products", async () => {
    const user = userEvent.setup();
    renderAt("/");
    const nav = screen.getByRole("navigation", { name: "Product categories" });
    await user.click(await within(nav).findByRole("link", { name: "Electronics" }));

    expect(await screen.findByRole("heading", { name: "Top rated in this category" }))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Additional products" })).toBeInTheDocument();
    expect(screen.getByText("Silicon Power SSD")).toBeInTheDocument();
    expect(screen.getByText("WD Gaming Drive")).toBeInTheDocument();
  });

  it("search button shows only matching products", async () => {
    const user = userEvent.setup();
    renderAt("/");
    await screen.findByText("Featured 1");

    const header = screen.getByRole("banner");
    await user.type(within(header).getByLabelText("Search products"), "ssd");
    await user.click(within(header).getByRole("button", { name: "Search" }));

    expect(await screen.findByText("Silicon Power SSD")).toBeInTheDocument();
    expect(screen.queryByText("Featured 1")).not.toBeInTheDocument();
    expect(screen.queryByText("WD Gaming Drive")).not.toBeInTheDocument();
    expect(calls.some((call) => call.url === "/api/products/search?q=ssd")).toBe(true);
  });

  it("clicking a product tile opens the product details page", async () => {
    const user = userEvent.setup();
    renderAt("/categories/electronics");
    await user.click(await screen.findByRole("link", { name: /Silicon Power SSD/ }));

    expect(await screen.findByRole("heading", { level: 1, name: "Silicon Power SSD" }))
      .toBeInTheDocument();
    expect(screen.getByText("Silicon Power SSD description")).toBeInTheDocument();
  });

  it("submitting an enquiry posts to the API and shows a thank-you message", async () => {
    const user = userEvent.setup();
    renderAt("/products/11");
    await screen.findByRole("heading", { level: 1, name: "Silicon Power SSD" });

    await user.type(screen.getByLabelText("Name"), "Alex Buyer");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Message"), "Please quote ten units.");
    await user.click(screen.getByRole("button", { name: "Enquire" }));

    expect(await screen.findByRole("heading", { name: "Thank you" })).toBeInTheDocument();
    const post = calls.find((call) => call.url === "/api/enquiries");
    expect(post?.init?.method).toBe("POST");
    expect(JSON.parse(String(post?.init?.body))).toMatchObject({
      productId: "11",
      name: "Alex Buyer",
      email: "alex@example.com",
    });
  });

  it("keeps the customer on the form with an error if the enquiry fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, init?: RequestInit) =>
        url === "/api/enquiries"
          ? json({ error: "We could not send your enquiry right now." }, 502)
          : fakeApi(url, init)
      )
    );
    const user = userEvent.setup();
    renderAt("/products/11");
    await screen.findByRole("heading", { level: 1, name: "Silicon Power SSD" });

    await user.type(screen.getByLabelText("Name"), "Alex Buyer");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Message"), "Please quote ten units.");
    await user.click(screen.getByRole("button", { name: "Enquire" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("could not send your enquiry");
    expect(screen.queryByRole("heading", { name: "Thank you" })).not.toBeInTheDocument();
  });
});
