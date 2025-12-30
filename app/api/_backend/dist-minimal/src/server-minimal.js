"use strict";
/**
 * Minimal Spiralogic Oracle Server - Clean Startup
 * Focuses on our new services without legacy complexity
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Our clean new services
const orchestrator_routes_1 = __importDefault(require("./routes/orchestrator.routes"));
const voiceJournaling_routes_1 = __importDefault(require("./routes/voiceJournaling.routes"));
const semanticJournaling_routes_1 = __importDefault(require("./routes/semanticJournaling.routes"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "3001", 10);
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
    }
});
app.use(limiter);
// Body parsing and compression
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Request logging
app.use((0, morgan_1.default)(':method :url :status :res[content-length] - :response-time ms'));
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
        features: [
            'Sacred Journey Orchestration',
            'Voice Journaling with Whisper',
            'Semantic Pattern Recognition',
            'Safety & Crisis Moderation',
            'Archetypal Constellation Mapping'
        ]
    });
});
// Mount our new service routes
app.use('/api/orchestrator', orchestrator_routes_1.default);
app.use('/api/voice', voiceJournaling_routes_1.default);
app.use('/api/semantic', semanticJournaling_routes_1.default);
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
            '/api/semantic'
        ]
    });
});
// Global error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Please try again'
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 SpiralogicOracle Server Ready!`);
    console.log(`🔮 Running at: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`📡 API docs: http://localhost:${PORT}/api`);
    console.log('');
    console.log('Available Services:');
    console.log('✅ Sacred Journey Orchestration');
    console.log('✅ Voice Journaling (Whisper)');
    console.log('✅ Semantic Pattern Recognition');
    console.log('✅ Safety & Crisis Moderation');
    console.log('');
});
exports.default = app;
