import type { NextFunction, Request, Response } from "express";

export type RateLimitOptions = {
  windowMs: number;
  max: number;
  now?: () => number;
};

/**
 * Fixed-window, per-IP limiter held in memory. Good enough for a single API
 * instance; behind several instances this would move to a shared store
 * (ElastiCache) or to the edge (API Gateway / WAF rate rules).
 */
export function rateLimit({ windowMs, max, now = Date.now }: RateLimitOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? "unknown";
    const time = now();
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= time) {
      entry = { count: 0, resetAt: time + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - time) / 1000));
      res.status(429).json({ error: "Too many enquiries. Please try again shortly." });
      return;
    }

    if (hits.size > 10_000) {
      for (const [ip, value] of hits) {
        if (value.resetAt <= time) hits.delete(ip);
      }
    }

    next();
  };
}
