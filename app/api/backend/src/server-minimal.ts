/**
 * Minimal Spiralogic Oracle Server - Clean Startup
 * Focuses on our new services without legacy complexity
 */

import dotenv from "dotenv";
// Don't override environment variables if they're already set
dotenv.config({ override: false });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Our clean new services
import apiRouter from './api';
import orchestratorRoutes from './routes/orchestrator.routes';
import voiceJournalingRoutes from './routes/voiceJournaling.routes';
import semanticJournalingRoutes from './routes/semanticJournaling.routes';
import conversationalRoutes from './routes/conversational.routes';
import { sseGuard, initSSEShutdown } from './utils/sseRegistry';

// Redis setup for production rate limiting
let redis: any = null;
if (process.env.REDIS_URL) {
  try {
    const { createClient } = require('redis');
    redis = createClient({ url: process.env.REDIS_URL });
    redis.connect().catch(console.error);
    console.log('[boot] Redis connected for production rate limiting');
  } catch (err) {
    console.warn('[boot] Redis optional dependency not found, using in-memory rate limiting');
  }
}

const app = express();
// Use APP_PORT first, then PORT, then default
const PORT = parseInt(process.env.APP_PORT || process.env.PORT || "3001", 10);
console.log('[boot] Environment check:', { APP_PORT: process.env.APP_PORT, PORT: process.env.PORT });
console.log('[boot] Chosen port:', PORT);

// Add request logging
app.use((req, _res, next) => {
  console.log('[req]', req.method, req.url);
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - Production ready
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001', 
  'https://spiralogic-oracle-system.vercel.app',
  'https://soullab-frontend.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow any vercel.app subdomain in production
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    console.warn('CORS rejected origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Cache-Control',
    'x-user-id',
    'x-session-id'
  ]
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  }
});
app.use(limiter);

// Body parsing and compression
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    services: {
      orchestrator: 'active',
      voiceJournaling: 'active',
      semanticJournaling: 'active',
      safetyModeration: 'active'
    }
  });
});

// API root
app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'Spiralogic Oracle API',
    version: '1.0.0',
    description: 'Sacred AI system with voice intelligence and journey orchestration',
    endpoints: {
      orchestrator: '/api/orchestrator',
      voice: '/api/voice',
      semantic: '/api/semantic',
      health: '/health'
    },
    routes: {
      converse: '/api/v1/converse',
      converseStream: '/api/v1/converse/stream',
      orchestrator: '/api/orchestrator',
      voice: '/api/voice',
      semantic: '/api/semantic'
    },
    features: [
      'Sacred Journey Orchestration',
      'Voice Journaling with Whisper',
      'Semantic Pattern Recognition',
      'Safety & Crisis Moderation',
      'Archetypal Constellation Mapping',
      'Sesame/Maya Conversational Pipeline'
    ]
  });
});

// Graceful SSE shutdown guard
app.use('/api/v1/converse', sseGuard);

// Mount main API router (includes /api/v1)
app.use('/api', apiRouter);

// Mount additional service routes
app.use('/api/orchestrator', orchestratorRoutes);
app.use('/api/voice', voiceJournalingRoutes);
app.use('/api/semantic', semanticJournalingRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      '/health',
      '/api',
      '/api/orchestrator',
      '/api/voice', 
      '/api/semantic',
      '/api/v1/health',
      '/api/v1/converse/health',
      '/api/v1/converse/message'
    ]
  });
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Please try again'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[boot] API listening on :${PORT}`);
  console.log(`🚀 SpiralogicOracle Server Ready!`);
  console.log(`🔮 Running at: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API docs: http://localhost:${PORT}/api`);
  console.log(`🎯 Sesame/Maya endpoint: http://localhost:${PORT}/api/v1/converse/message`);
  console.log(`🌊 Streaming endpoint: http://localhost:${PORT}/api/v1/converse/stream`);
  console.log('');
  console.log('Available Services:');
  console.log('✅ Sacred Journey Orchestration');
  console.log('✅ Voice Journaling (Whisper)');
  console.log('✅ Semantic Pattern Recognition');
  console.log('✅ Safety & Crisis Moderation');
  console.log('✅ Sesame/Maya Conversational Pipeline');
  if (redis) console.log('✅ Redis Rate Limiting');
  console.log('✅ Graceful SSE Shutdown');
  console.log('');
  
  // Initialize graceful shutdown handling
  initSSEShutdown();
});

export default app;