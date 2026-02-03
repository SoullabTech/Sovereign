/**
 * CORS Middleware Configuration
 *
 * Configures Cross-Origin Resource Sharing for the API.
 * Allows the frontend at soullab.life to make requests.
 */

import cors from 'cors';
import { Request } from 'express';

/**
 * Get allowed origins from environment or defaults
 */
function getAllowedOrigins(): string[] {
  if (process.env.CORS_ORIGINS) {
    return process.env.CORS_ORIGINS.split(',').map(o => o.trim());
  }

  // Default allowed origins
  return [
    'https://soullab.life',
    'https://www.soullab.life',
    'https://loralee.soullab.life',
    'https://chart.soullab.life',
    'https://elementalalchemy.soullab.life',
    // Development
    'http://localhost:3000',
    'http://localhost:3001',
    // Capacitor (iOS/Android)
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost'
  ];
}

/**
 * Check if origin is allowed
 */
function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) return true; // Allow requests with no origin (mobile apps, curl)

  return allowedOrigins.some(allowed => {
    // Exact match
    if (allowed === origin) return true;

    // Wildcard subdomain match (e.g., *.soullab.life)
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain) || origin === `https://${domain}` || origin === `http://${domain}`;
    }

    return false;
  });
}

/**
 * Create CORS middleware with proper configuration
 */
export function createCorsMiddleware() {
  const allowedOrigins = getAllowedOrigins();

  return cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-User-ID',
      'X-Request-ID',
      'X-Stellium-Portal',
      'X-MAIA-Origin'
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-Processing-Time'
    ],
    maxAge: 86400 // 24 hours
  });
}

export default createCorsMiddleware;
