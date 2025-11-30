// Rate Limiting Middleware with Redis Backend
import rateLimit from "express-rate-limit";
import { Redis } from "ioredis";
import { RedisStore } from "rate-limit-redis";
import type { Request, Response, NextFunction } from "express";

const isDev = process.env.NODE_ENV !== "production";

// Reuse your Docker compose settings if present
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(REDIS_URL);

const commonOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // don't rate-limit health, static assets, or local dev tools
    if (req.path.startsWith("/health")) return true;
    if (req.path.startsWith("/api/v1/health")) return true;
    if (req.path.startsWith("/_next")) return true;
    if (req.path.startsWith("/debug/psi")) return true;
    if (req.hostname === "localhost" || req.ip?.startsWith("127.")) return isDev;
    return false;
  },
};

export const apiLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: isDev ? 1000 : 120, // dev friendly, production sane
  message: { ok: false, code: "RATE_LIMIT", message: "Too many requests" },
  store: new RedisStore({ 
    sendCommand: (...args: any[]) => redis.call(args[0], ...args.slice(1)) as any,
    prefix: "rl:api:"
  }),
  ...commonOptions,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60_000, // 15 min
  max: isDev ? 500 : 10, // stricter for auth endpoints in prod
  message: { ok: false, code: "RATE_LIMIT_AUTH", message: "Too many auth attempts" },
  store: new RedisStore({ 
    sendCommand: (...args: any[]) => redis.call(args[0], ...args.slice(1)) as any,
    prefix: "rl:auth:"
  }),
  ...commonOptions,
});

export const oracleRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 500 : 20,
  message: { ok: false, code: "RATE_LIMIT_ORACLE", message: "Oracle queries limited. Please pause for sacred reflection." },
  store: new RedisStore({ 
    sendCommand: (...args: any[]) => redis.call(args[0], ...args.slice(1)) as any,
    prefix: "rl:oracle:"
  }),
  ...commonOptions,
});

export const ainEngineRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 500 : 60,
  message: { ok: false, code: "RATE_LIMIT_AIN", message: "AIN Engine rate limit reached. Please try again later." },
  store: new RedisStore({ 
    sendCommand: (...args: any[]) => redis.call(args[0], ...args.slice(1)) as any,
    prefix: "rl:ain:"
  }),
  ...commonOptions,
});

// Backward compatibility alias
export const defaultRateLimiter = apiLimiter;

export function bypassRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const bypassHeader = req.headers["x-bypass-rate-limit"];
  const bypassSecret = process.env.RATE_LIMIT_BYPASS_SECRET;

  if (bypassSecret && bypassHeader === bypassSecret) {
    next();
    return;
  }

  // Use the same skip logic as commonOptions
  if (commonOptions.skip(req)) {
    next();
    return;
  }

  defaultRateLimiter(req, res, next);
}

export function dynamicRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = (req as any).user;

  if (!user) {
    return defaultRateLimiter(req, res, next);
  }

  const userTier = user.subscription_tier || "free";

  const tierLimits = {
    free: { windowMs: 60 * 1000, max: isDev ? 500 : 10 },
    basic: { windowMs: 60 * 1000, max: isDev ? 500 : 30 },
    premium: { windowMs: 60 * 1000, max: isDev ? 500 : 100 },
    enterprise: { windowMs: 60 * 1000, max: isDev ? 500 : 500 },
  };

  const limits =
    tierLimits[userTier as keyof typeof tierLimits] || tierLimits.free;

  const tierLimiter = rateLimit({
    ...limits,
    message: { ok: false, code: "RATE_LIMIT_TIER", message: `You have reached your ${userTier} tier rate limit. Please upgrade for higher limits.` },
    keyGenerator: (req: Request) => `user:${user.id}:${userTier}`,
    store: new RedisStore({ 
      sendCommand: (...args: any[]) => redis.call(args[0], ...args.slice(1)) as any,
      prefix: `rl:tier:${userTier}:`
    }),
    ...commonOptions,
  });

  return tierLimiter(req, res, next);
}

export default {
  api: apiLimiter,
  auth: authLimiter, 
  oracle: oracleRateLimiter,
  ainEngine: ainEngineRateLimiter,
  bypass: bypassRateLimit,
  dynamic: dynamicRateLimiter,
  // Backward compatibility
  default: defaultRateLimiter,
};
