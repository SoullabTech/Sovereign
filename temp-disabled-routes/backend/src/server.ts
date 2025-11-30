// Spiralogic Oracle Backend Server - Production Ready
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import apiRouter from "./api";
import { logger } from "./utils/logger";
import { validateEnvironmentVariables } from "./utils/sharedUtilities";
import { findAvailablePort, getPortProcess } from "./utils/portDetector";
import { writeFileSync } from "fs";
import { join } from "path";

// Environment verification
console.log("🔍 Environment Check:");
console.log(process.env.OPENAI_API_KEY ? "✅ OpenAI loaded" : "❌ Missing OPENAI_API_KEY");
console.log(process.env.ANTHROPIC_API_KEY ? "✅ Anthropic loaded" : "❌ Missing ANTHROPIC_API_KEY");
console.log(process.env.ELEVENLABS_API_KEY ? "✅ ElevenLabs loaded" : "❌ Missing ELEVENLABS_API_KEY");
console.log(process.env.SUPABASE_URL ? "✅ Supabase loaded" : "❌ Missing SUPABASE_URL");
console.log(process.env.USE_SESAME ? "✅ Sesame enabled" : "❌ Sesame disabled");

// Validate required environment variables
validateEnvironmentVariables([
  "JWT_SECRET",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
]);

const PREFERRED_PORT = parseInt(process.env.PORT || "3002", 10);

// Mount unified API router
app.use("/api", apiRouter);

// Legacy route redirect for backward compatibility
app.use("/api/oracle", (req, res) => {
  res.status(301).json({
    success: false,
    errors: [
      "This endpoint has moved. Please use /api/v1/personal-oracle instead",
    ],
    redirect: "/api/v1/personal-oracle",
  });
});

// Start server with port detection
async function startServer() {
  try {
    // Check if preferred port is available
    const processInfo = await getPortProcess(PREFERRED_PORT);
    if (processInfo) {
      logger.warn(`Port ${PREFERRED_PORT} is already in use by: ${processInfo}`);
    }
    
    // Find available port
    const PORT = await findAvailablePort(PREFERRED_PORT);
    
    if (PORT !== PREFERRED_PORT) {
      logger.info(`Using port ${PORT} instead of preferred port ${PREFERRED_PORT}`);
    }
    
    // Update environment for child processes
    process.env.PORT = PORT.toString();
    
    // Write port to file for frontend to read
    try {
      const portFile = join(__dirname, '..', '.port');
      writeFileSync(portFile, PORT.toString());
      logger.info(`Wrote port ${PORT} to ${portFile}`);
    } catch (error) {
      logger.warn("Could not write port file", error);
    }
    
    app.listen(PORT, () => {
      logger.info("🔮 Spiralogic Oracle Backend Server Started", {
        port: PORT,
        preferredPort: PREFERRED_PORT,
        environment: process.env.NODE_ENV || "development",
        version: process.env.APP_VERSION || "1.0.0",
        apiVersion: "v1",
      });

      console.log(`🔮 Spiralogic Oracle running at http://localhost:${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api/v1`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      
      if (PORT !== PREFERRED_PORT) {
        console.log(`⚠️  Note: Using port ${PORT} instead of ${PREFERRED_PORT}`);
      }
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
