// Simple MAIA Backend without Redis dependency
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Basic middleware setup
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: false,
}));

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
}));

app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Simple logging
app.use(morgan("combined"));

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: "1.0.0",
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        name: "MAIA Backend API",
        version: "1.0.0",
        status: "operational",
        endpoints: {
            api: "/api/v1",
            health: "/health",
        },
    });
});

// Simple conversation endpoint for MAIA
app.post("/api/v1/personal-oracle", (req, res) => {
    // Basic response to test connectivity
    res.json({
        success: true,
        message: "MAIA backend is connected! Full oracle functionality requires complete setup.",
        timestamp: new Date().toISOString(),
        received: {
            message: req.body.message || "No message provided",
            user: req.body.user || "Anonymous"
        }
    });
});

// Oracle chat endpoint (expected by frontend API client)
app.post("/api/oracle/chat", (req, res) => {
    res.json({
        message: `Oracle response: I understand you're saying "${req.body.message || "Hello"}". I'm here and responding from the backend server.`,
        mayaResponse: `MAIA Oracle Response: I acknowledge your message "${req.body.message || "Hello"}". The consciousness field is active and ready to engage in deeper dialogue.`,
        sessionId: `session-${Date.now()}`,
        uiState: {
            showVirtualOracle: true,
            oracleState: 'engaged'
        },
        metadata: {
            timestamp: new Date().toISOString(),
            backend: 'simple-express-server'
        }
    });
});

// Fallback for missing routes
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        error: "Endpoint not found",
        path: req.originalUrl
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🔮 MAIA Backend running at http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api/v1`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});