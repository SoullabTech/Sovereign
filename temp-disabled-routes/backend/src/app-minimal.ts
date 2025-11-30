// Minimal app configuration for Sacred Techno-Interface
import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Essential middleware only
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging in development only
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "🌀 Sacred Techno-Interface - Minimal Core Active",
    status: "operational",
  });
});

export default app;
