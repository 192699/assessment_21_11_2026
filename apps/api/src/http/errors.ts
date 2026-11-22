import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { EmailDeliveryError } from "../ports/email-sender";
import { CatalogueUnavailableError } from "../ports/product-catalogue";
import { UnknownProductError } from "../services/enquiry-service";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof UnknownProductError) {
    res.status(404).json({ error: error.message });
    return;
  }

  if (error instanceof CatalogueUnavailableError) {
    console.error(error);
    res.status(503).json({ error: "Product catalogue is temporarily unavailable" });
    return;
  }

  if (error instanceof EmailDeliveryError) {
    console.error(error);
    res.status(502).json({
      error: "We could not send your enquiry right now. Please try again shortly.",
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  // body-parser errors (malformed JSON, payload too large) carry a 4xx status.
  const status = (error as { status?: unknown } | null)?.status;
  if (typeof status === "number" && status >= 400 && status < 500) {
    res.status(status).json({ error: status === 413 ? "Request too large" : "Invalid request body" });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Unexpected server error" });
}
