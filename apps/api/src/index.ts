/**
 * MAIA API Service
 *
 * Standalone Express API service for MAIA Sovereign.
 * Handles all API requests, allowing Next.js to be a pure static frontend.
 *
 * Endpoints are versioned under /v1/*
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE INVARIANT: MAIA-First Hierarchy
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * MAIA = Platform/Product (the living temple, interface, relationship)
 * AIN  = Engine (deliberative core, computation primitives)
 *
 * This service is the MAIA API. AIN is a DEPENDENCY called by MAIA, never the
 * reverse. AIN endpoints are namespaced under /v1/maia/ain/* or internal-only.
 *
 * All external sites (practitioner portals, partner sites) talk to THIS API.
 * MAIA API is the multi-tenant backbone for all Soullab products.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.js';
import { authMiddleware } from './middleware/auth.js';
import healthRouter from './routes/health.js';
import membersRouter from './routes/members/index.js';
import portalRouter from './routes/portal/index.js';
import tenantRouter from './routes/tenant/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for production (behind Caddy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'https://soullab.life',
  'https://www.soullab.life',
  'https://loralee.soullab.life',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    // Check if origin matches any allowed origin or pattern
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
        return pattern.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-User-ID', 'X-Request-ID']
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// API routes (versioned under /v1)
app.use('/v1/health', healthRouter);
app.use('/v1/members', membersRouter);
app.use('/v1/portal', portalRouter);
app.use('/v1/tenant', tenantRouter);

// TODO: Add more route imports as they are migrated
// app.use('/v1/maia', maiaRouter);
// app.use('/v1/maia/ain', ainRouter);  // AIN namespaced under MAIA
// app.use('/v1/consciousness', consciousnessRouter);
// app.use('/v1/astrology', astrologyRouter);
// etc.

// Root health check (for Docker healthcheck)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'maia-api' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    MAIA API Service                        ║
╠════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                              ║
║  Environment: ${process.env.NODE_ENV || 'development'}                           ║
║  CORS Origins: ${allowedOrigins.length} configured                         ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
