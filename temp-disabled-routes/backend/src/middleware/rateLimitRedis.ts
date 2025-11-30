import type { Request, Response, NextFunction } from "express";
import type { RedisClientType } from "redis";

type Opts = {
  redis: RedisClientType;
  keyPrefix: string;            // e.g. "rl:msg" or "rl:stream"
  windowSec: number;            // e.g. 60
  max: number;                  // e.g. 60 (msg) or 30 (stream)
  keyFn?: (req: Request) => string; // optional custom key
};

export function rateLimitRedis(opts: Opts) {
  const { redis, keyPrefix, windowSec, max, keyFn } = opts;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const bucket = Math.floor(now / windowSec); // fixed window
      const ident = keyFn ? keyFn(req) : req.ip || "unknown";
      const key = `${keyPrefix}:${ident}:${bucket}`;

      // increment & set expire atomically
      const count = await redis.multi().incr(key).expire(key, windowSec, "NX").exec();
      // `count?.[0]?.[1]` is the INCR result
      const current = Number((count && count[0] && count[0][1]) ?? 1);

      const reset = (bucket + 1) * windowSec; // epoch seconds when window resets
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - current)));
      res.setHeader("X-RateLimit-Reset", String(reset));

      if (current > max) {
        const retryAfter = reset - now;
        res.setHeader("Retry-After", String(retryAfter));
        return res.status(429).json({
          success: false,
          error: "rate_limited",
          message: "Too many requests. Please try again shortly.",
          retryAfter,
        });
      }

      return next();
    } catch (err) {
      // fail-open: if redis hiccups, don't block legit traffic
      return next();
    }
  };
}