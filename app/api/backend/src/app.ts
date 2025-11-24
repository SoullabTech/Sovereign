// Spiralogic Oracle Backend - Express App Configuration
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import {
  responseFormatter,
  addRequestId,
} from "./api/middleware/responseFormatter";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter";
import { validateContentSecurity } from "./middleware/inputValidation";
import { logger } from "./utils/logger";
import { healthRouter } from "./server/health";

const app = express();

// Behind proxy (Render/Vercel/NGINX), keep correct IP for rate limiting
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
  }),
);

// Compression and performance
app.use(compression());

// Static file serving for audio files
app.use('/audio', express.static('public/audio', {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    } else if (path.endsWith('.wav')) {
      res.setHeader('Content-Type', 'audio/wav');
    }
  }
}));

// Logging
app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }),
);

// Request parsing and validation
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(validateContentSecurity);

// Rate limiting - BEFORE routes  
app.use("/api", apiLimiter);
app.use("/auth", authLimiter);

// Request ID and response formatting
app.use(addRequestId);
app.use(responseFormatter);

// Health endpoints (must be before API routes)
app.use("/", healthRouter);

// Health check route (before API routes for monitoring)
app.get("/health", (req, res) => {
  res.success({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.APP_VERSION || "1.0.0",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.success({
    name: "Spiralogic Oracle Backend",
    version: process.env.APP_VERSION || "1.0.0",
    status: "operational",
    endpoints: {
      api: "/api/v1",
      health: "/health",
      docs: "/docs",
    },
  });
});

// Test routes (development only)
if (process.env.NODE_ENV !== "production") {
  // app.use('/api/test', testRouter); // TODO: Implement test router if needed
}

export default app;
// Trigger Railway deploy
