import { Request, Response, NextFunction } from "express";

type Options = { windowMs: number; max: number; key?(req: Request): string };
type Bucket = { count: number; resetAt: number };

export function rateLimit(opts: Options) {
  const windowMs = Math.max(1000, opts.windowMs);
  const max = Math.max(1, opts.max);
  const keyFn = opts.key ?? ((req) => (req.ip || req.headers["x-forwarded-for"] as string || "anon"));
  const store = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const k = keyFn(req);
    const b = store.get(k) ?? { count: 0, resetAt: now + windowMs };

    if (now > b.resetAt) { b.count = 0; b.resetAt = now + windowMs; }
    b.count += 1;
    store.set(k, b);

    const remaining = Math.max(0, max - b.count);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(b.resetAt / 1000)));

    if (b.count > max) {
      res.status(429).json({
        success: false,
        error: "rate_limited",
        message: "Too many requests, please slow down.",
        retryAfterSeconds: Math.ceil((b.resetAt - now) / 1000)
      });
      return;
    }
    next();
  };
}