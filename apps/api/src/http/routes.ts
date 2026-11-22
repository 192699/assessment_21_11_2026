import { Router } from "express";
import { enquiryInputSchema } from "../domain/enquiry";
import type { CatalogueService } from "../services/catalogue-service";
import type { EnquiryService } from "../services/enquiry-service";
import { HttpError } from "./errors";

export function createRouter(
  catalogue: CatalogueService,
  enquiries: EnquiryService
): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  router.get("/catalogue/featured", async (_req, res, next) => {
    try {
      res.json({ products: await catalogue.featured() });
    } catch (error) {
      next(error);
    }
  });

  router.get("/categories", async (_req, res, next) => {
    try {
      res.json({ categories: await catalogue.categories() });
    } catch (error) {
      next(error);
    }
  });

  router.get("/categories/:categoryId", async (req, res, next) => {
    try {
      const result = await catalogue.category(req.params.categoryId);
      if (!result) {
        throw new HttpError(404, "Category not found");
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/products/search", async (req, res, next) => {
    try {
      const query = String(req.query.q ?? "");
      if (!query.trim()) {
        throw new HttpError(400, "Search term is required");
      }
      res.json({ query, products: await catalogue.search(query) });
    } catch (error) {
      next(error);
    }
  });

  router.get("/products/:id", async (req, res, next) => {
    try {
      const product = await catalogue.product(req.params.id);
      if (!product) {
        throw new HttpError(404, "Product not found");
      }
      res.json({ product });
    } catch (error) {
      next(error);
    }
  });

  router.post("/enquiries", async (req, res, next) => {
    try {
      const input = enquiryInputSchema.parse(req.body);
      await enquiries.submit(input);
      res.status(201).json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
