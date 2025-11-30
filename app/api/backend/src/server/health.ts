import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.status(200).json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "spiralogic-oracle-system",
    version: "1.0.0-beta"
  });
});

healthRouter.get("/healthz", (_req, res) => {
  res.status(200).send("ok");
});

// API v1 health endpoint for Beta Gate compatibility
healthRouter.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    status: "healthy", 
    timestamp: new Date().toISOString(),
    api_version: "v1",
    service: "spiralogic-oracle-system"
  });
});