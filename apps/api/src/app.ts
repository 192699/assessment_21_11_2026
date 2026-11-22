import cors from "cors";
import express from "express";
import type { AppConfig } from "./config";
import { errorHandler } from "./http/errors";
import { createRouter } from "./http/routes";
import type { EmailSender } from "./ports/email-sender";
import type { ProductCatalogue } from "./ports/product-catalogue";
import { CatalogueService } from "./services/catalogue-service";
import { EnquiryService } from "./services/enquiry-service";

export type AppDeps = {
  config: AppConfig;
  catalogue: ProductCatalogue;
  emailSender: EmailSender;
};

export function createApp(deps: AppDeps) {
  const catalogueService = new CatalogueService(
    deps.catalogue,
    deps.config.featuredCount,
    deps.config.categoryFeaturedCount
  );
  const enquiryService = new EnquiryService(
    deps.catalogue,
    deps.emailSender,
    deps.config.salesInbox,
    deps.config.fromEmail
  );

  const app = express();
  app.disable("x-powered-by");
  app.use(
    cors({
      origin: deps.config.webOrigin,
    })
  );
  app.use(express.json({ limit: "32kb" }));
  app.use("/api", createRouter(catalogueService, enquiryService));
  app.use(errorHandler);
  return app;
}
