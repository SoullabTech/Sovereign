// JWT Configuration for Authentication System
import { logger } from "../utils/logger";

export interface JWTConfig {
  secret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  issuer: string;
  audience: string;
}

/**
 * JWT Configuration with environment variable fallbacks
 */
export const jwtConfig: JWTConfig = {
  secret:
    process.env.JWT_SECRET ||
    (() => {
      if (process.env.NODE_ENV === "production") {
        logger.error("JWT_SECRET not set in production environment");
        throw new Error(
          "JWT_SECRET environment variable is required in production",
        );
      }
      logger.warn("Using fallback JWT_SECRET for development");
      return "dev_fallback_secret_change_in_production";
    })(),

  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRES_IN || "24h",
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  issuer: process.env.JWT_ISSUER || "spiralogic-oracle",
  audience: process.env.JWT_AUDIENCE || "spiralogic-oracle-users",
};

/**
 * Validate JWT configuration
 */
export function validateJWTConfig(): void {
  if (!jwtConfig.secret || jwtConfig.secret.length < 32) {
    throw new Error("JWT secret must be at least 32 characters long");
  }

  // Validate expiry format (simple check)
  const expiryRegex = /^\d+[dhms]$/;
  if (!expiryRegex.test(jwtConfig.accessTokenExpiry)) {
    throw new Error(
      'Invalid JWT access token expiry format. Use format like "24h", "30d", "300s"',
    );
  }

  if (!expiryRegex.test(jwtConfig.refreshTokenExpiry)) {
    throw new Error(
      'Invalid JWT refresh token expiry format. Use format like "7d", "30d"',
    );
  }

  logger.info("JWT configuration validated successfully", {
    accessTokenExpiry: jwtConfig.accessTokenExpiry,
    refreshTokenExpiry: jwtConfig.refreshTokenExpiry,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });
}

/**
 * Security recommendations for JWT configuration
 */
export const securityRecommendations = {
  // Recommended minimum secret length
  minSecretLength: 32,

  // Recommended token lifetimes
  recommendedAccessTokenExpiry: "15m", // Short-lived access tokens
  recommendedRefreshTokenExpiry: "7d", // Longer-lived refresh tokens

  // Security headers to include
  securityHeaders: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'",
  },
};

// Initialize and validate configuration on module load
try {
  validateJWTConfig();
} catch (error) {
  logger.error("JWT configuration validation failed", {
    error: error instanceof Error ? error.message : "Unknown error",
  });
  if (process.env.NODE_ENV === "production") {
    throw error;
  }
}
