export type AppConfig = {
  port: number;
  webOrigin: string;
  productSourceUrl: string;
  productCacheTtlMs: number;
  featuredCount: number;
  categoryFeaturedCount: number;
  smtpHost: string;
  smtpPort: number;
  salesInbox: string;
  fromEmail: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: Number(env.API_PORT ?? 3001),
    webOrigin: env.WEB_ORIGIN ?? "http://localhost:5173",
    productSourceUrl: (env.PRODUCT_SOURCE_URL ?? "https://fakestoreapi.com").replace(
      /\/$/,
      ""
    ),
    productCacheTtlMs: Number(env.PRODUCT_CACHE_TTL_MS ?? 300_000),
    featuredCount: Number(env.FEATURED_COUNT ?? 5),
    categoryFeaturedCount: Number(env.CATEGORY_FEATURED_COUNT ?? 3),
    smtpHost: env.SMTP_HOST ?? "127.0.0.1",
    smtpPort: Number(env.SMTP_PORT ?? 1025),
    salesInbox: env.SALES_INBOX ?? "sales@example.com",
    fromEmail: env.FROM_EMAIL ?? "catalogue@example.com",
  };
}
