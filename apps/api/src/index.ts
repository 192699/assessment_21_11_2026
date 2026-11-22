import { FakeStoreCatalogue } from "./adapters/fake-store/fake-store-catalogue";
import { SmtpEmailSender } from "./adapters/smtp/smtp-email-sender";
import { createApp } from "./app";
import { loadConfig } from "./config";

const config = loadConfig();
const app = createApp({
  config,
  catalogue: new FakeStoreCatalogue(config.productSourceUrl, config.productCacheTtlMs),
  emailSender: new SmtpEmailSender(config.smtpHost, config.smtpPort),
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`API listening on ${config.port}`);
});
