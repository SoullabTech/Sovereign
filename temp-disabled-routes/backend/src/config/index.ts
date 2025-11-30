// oracle-backend/src/config/index.ts

import "dotenv/config";

interface Config {
  server: {
    port: number;
    env: string;
  };
  auth: {
    jwtSecret: string;
    jwtRefreshSecret: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logging: {
    level: string;
    format: string;
  };
  cors: {
    origin: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
}

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || "5001", 10),
    env: process.env.NODE_ENV || "development",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "default_jwt_secret",
    jwtRefreshSecret:
      process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.MORGAN_FORMAT || "combined",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },
  supabase: {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
};
