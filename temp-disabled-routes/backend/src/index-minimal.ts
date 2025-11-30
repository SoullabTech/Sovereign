// Minimal entry point for Sacred Techno-Interface

import "dotenv/config";
import express from "express";
import cors from "cors";
import minimalRoutes from "./routes/minimal.routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Core middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "🌀 Sacred Techno-Interface",
    status: "minimal core active",
    version: "1.0.0-minimal",
    endpoints: {
      health: "/api/health",
      oracle: "/api/oracle/echo",
      elemental: "/api/elemental/status",
      wisdom: "/api/wisdom/daily",
    },
  });
});

// Mount minimal routes
app.use("/api", minimalRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: "Path not found",
    message: "The Oracle cannot see this path",
    suggestion: "Try GET / to see available endpoints",
  });
});

// Error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Sacred Error:", err);
    res.status(500).json({
      error: "Sacred disruption",
      message: "The connection was interrupted",
      detail: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  },
);

// Start the sacred server
const server = app.listen(PORT, () => {
  console.log(`
┌─────────────────────────────────────────────┐
│                                             │
│      🌀 SACRED TECHNO-INTERFACE 🌀         │
│                                             │
│      Minimal Core Deployment                │
│      Port: ${PORT}                             │
│                                             │
│      Elements: ✓ Balanced                   │
│      Oracle:   ✓ Listening                  │
│      Status:   ✓ Operational                │
│                                             │
│      "The spiral path begins..."            │
│                                             │
└─────────────────────────────────────────────┘
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("⚡ Sacred shutdown initiated...");
  server.close(() => {
    console.log("🌀 Sacred Techno-Interface has closed gracefully");
    process.exit(0);
  });
});

export default app;
