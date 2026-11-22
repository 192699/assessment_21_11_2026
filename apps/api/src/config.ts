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

function nonNegativeInt(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: number
): number {
  const raw = env[name];
  if (raw === undefined || raw.trim() === "") {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid config: ${name} must be a non-negative integer (got "${raw}")`);
  }
  return value;
}

/** Fails fast at boot on bad configuration rather than misbehaving at request time. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: nonNegativeInt(env, "API_PORT", 3001),
    webOrigin: env.WEB_ORIGIN ?? "http://localhost:5173",
    productSourceUrl: (env.PRODUCT_SOURCE_URL ?? "https://fakestoreapi.com").replace(
      /\/$/,
      ""
    ),
    productCacheTtlMs: nonNegativeInt(env, "PRODUCT_CACHE_TTL_MS", 300_000),
    featuredCount: nonNegativeInt(env, "FEATURED_COUNT", 5),
    categoryFeaturedCount: nonNegativeInt(env, "CATEGORY_FEATURED_COUNT", 3),
    smtpHost: env.SMTP_HOST ?? "127.0.0.1",
    smtpPort: nonNegativeInt(env, "SMTP_PORT", 1025),
    salesInbox: env.SALES_INBOX ?? "sales@example.com",
    fromEmail: env.FROM_EMAIL ?? "catalogue@example.com",
  };
}
