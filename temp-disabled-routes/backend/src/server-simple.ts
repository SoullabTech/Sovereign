// Minimal server for Render deployment
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    message: "🔮 Oracle backend is operational",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "🌀 Sacred Techno-Interface",
    status: "operational",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
    },
  });
});

// Basic API endpoint
app.get("/api", (_req, res) => {
  res.json({
    message: "Oracle API ready",
    version: "1.0.0",
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The Oracle cannot see this path",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔮 Oracle backend running at http://localhost:${PORT}`);
});

export default app;
