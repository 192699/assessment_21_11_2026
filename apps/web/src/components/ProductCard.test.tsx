import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ProductCard } from "./ProductCard";

describe("ProductCard", () => {
  it("links a product tile to the product details page", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ProductCard
          product={{
            id: "11",
            title: "Silicon Power SSD",
            description: "Fast internal drive",
            price: { amount: 109, currency: "USD" },
            category: { id: "electronics", name: "electronics" },
            imageUrl: "https://example.com/ssd.png",
            rating: { score: 4.8, count: 319 },
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /Silicon Power SSD/i })).toHaveAttribute(
      "href",
      "/products/11"
    );
  });
});
