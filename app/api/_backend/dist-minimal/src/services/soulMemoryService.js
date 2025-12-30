"use strict";
// ===============================================
// SOUL MEMORY SERVICE - API INTEGRATION
// Connects SoulMemorySystem to Express endpoints
// ===============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.soulMemoryService = exports.SoulMemoryService = void 0;
const SoulMemorySystem_1 = require("../../memory/SoulMemorySystem");
const adjusterAgent_1 = require("../core/agents/adjusterAgent");
const logger_js_1 = require("../utils/logger.js");
class SoulMemoryService {
    constructor() {
        this.memorySystems = new Map();
        this.oracles = new Map();
        logger_js_1.logger.info("Soul Memory Service initialized");
    }
    // ===============================================
    // MEMORY SYSTEM MANAGEMENT
    // ===============================================
    async getOrCreateMemorySystem(userId) {
        if (!this.memorySystems.has(userId)) {
            const memorySystem = new SoulMemorySystem_1.SoulMemorySystem({
                userId,
                storageType: "sqlite",
                databasePath: `./soul_memory_${userId}.db`,
                memoryDepth: 100,
            });
            this.memorySystems.set(userId, memorySystem);
            logger_js_1.logger.info(`Created new Soul Memory System for user: ${userId}`);
        }
        return this.memorySystems.get(userId);
    }
    async getOrCreateOracle(userId, oracleName) {
        if (!this.oracles.has(userId)) {
            const oracle = new adjusterAgent_1.PersonalOracleAgent({
                userId,
                oracleName: oracleName || "Sacred Mirror",
                elementalResonance: "aether",
            });
            // Connect oracle to memory system
            const memorySystem = await this.getOrCreateMemorySystem(userId);
            await memorySystem.integrateWithOracle(oracle, userId);
            this.oracles.set(userId, oracle);
            logger_js_1.logger.info(`Created new Oracle for user: ${userId}`);
        }
        return this.oracles.get(userId);
    }
    // ===============================================
    // MEMORY OPERATIONS
    // ===============================================
    async storeOracleExchange(userId, userMessage, oracleResponse, metadata) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        return memorySystem.storeMemory({
            userId,
            type: "oracle_exchange",
            content: userMessage,
            element: metadata?.element || "aether",
            emotionalTone: metadata?.emotionalTone,
            shadowContent: metadata?.shadowContent || false,
            transformationMarker: metadata?.transformationMarker || false,
            oracleResponse,
            metadata: {
                sessionId: metadata?.sessionId,
                timestamp: new Date().toISOString(),
            },
        });
    }
    async storeJournalEntry(userId, content, metadata) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        return memorySystem.storeMemory({
            userId,
            type: "journal_entry",
            content,
            element: metadata?.element || "water",
            spiralPhase: metadata?.spiralPhase,
            shadowContent: metadata?.shadowContent || false,
            metadata: {
                source: "journal",
                timestamp: new Date().toISOString(),
            },
        });
    }
    async recordRitualMoment(userId, ritualType, content, element, oracleGuidance) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        return memorySystem.recordRitualMoment(userId, ritualType, content, element, oracleGuidance);
    }
    async recordBreakthrough(userId, content, insights, element) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        const memory = await memorySystem.storeMemory({
            userId,
            type: "breakthrough",
            content,
            element: element || "aether",
            transformationMarker: true,
            sacredMoment: true,
            metadata: {
                insights,
                breakthrough_type: "user_reported",
                timestamp: new Date().toISOString(),
            },
        });
        // Mark as transformation
        await memorySystem.markTransformation(memory.id, "breakthrough", insights);
        return memory;
    }
    // ===============================================
    // MEMORY RETRIEVAL
    // ===============================================
    async getUserMemories(userId, options) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        return memorySystem.retrieveMemories(userId, options);
    }
    async getSacredMoments(userId, limit = 10) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        return memorySystem.getSacredMoments(userId, limit);
    }
    async getTransformationJourney(userId) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        return memorySystem.getTransformationJourney(userId);
    }
    async getActiveArchetypes(userId) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        return memorySystem.getActiveArchetypes(userId);
    }
    async searchMemories(userId, query, options) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        return memorySystem.semanticSearch(userId, query, options);
    }
    // ===============================================
    // ARCHETYPAL PATTERNS
    // ===============================================
    async getActiveArchetypes(userId) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        return memorySystem.getActiveArchetypes(userId);
    }
    // ===============================================
    // MEMORY THREADS (JOURNEYS)
    // ===============================================
    async createMemoryThread(userId, threadName, threadType) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        return memorySystem.createMemoryThread(userId, threadName, threadType);
    }
    async getUserThreads(userId) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        return memorySystem.getUserThreads(userId);
    }
    async getMemoryThread(threadId) {
        // Find which user's memory system contains this thread
        for (const [userId, memorySystem] of this.memorySystems) {
            const thread = await memorySystem.getMemoryThread(threadId);
            if (thread)
                return thread;
        }
        return null;
    }
    // ===============================================
    // ORACLE INTEGRATION
    // ===============================================
    async processOracleMessage(userId, userMessage, sessionId) {
        const oracle = await this.getOrCreateOracle(userId);
        // Process message through Oracle's sacred mirror
        const oracleMessage = await oracle.processMessage(userMessage);
        // Store the exchange in memory
        const memory = await this.storeOracleExchange(userId, userMessage, oracleMessage.content, {
            element: this.detectElementFromResponse(oracleMessage.content),
            emotionalTone: oracleMessage.emotion,
            shadowContent: oracleMessage.transformationType === "shadow",
            transformationMarker: oracleMessage.transformationType === "resistance",
            sessionId,
        });
        // Get transformation metrics if available
        let transformationMetrics;
        try {
            transformationMetrics = oracle.getTransformationMetrics();
        }
        catch (error) {
            // Oracle might not have this method yet
            logger_js_1.logger.debug("Transformation metrics not available");
        }
        return {
            response: oracleMessage.content,
            memory,
            transformationMetrics,
        };
    }
    // ===============================================
    // RETREAT SUPPORT
    // ===============================================
    async activateRetreatMode(userId, phase) {
        const oracle = await this.getOrCreateOracle(userId);
        // Activate retreat mode on oracle if method exists
        if (oracle.activateRetreatMode) {
            await oracle.activateRetreatMode(phase);
        }
        // Store retreat activation in memory
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        await memorySystem.storeMemory({
            userId,
            type: "ritual_moment",
            content: `Retreat mode activated: ${phase}`,
            element: "aether",
            sacredMoment: true,
            ritualContext: "retreat_activation",
            metadata: {
                retreat_phase: phase,
                activated_at: new Date().toISOString(),
            },
        });
        logger_js_1.logger.info(`Retreat mode activated for user ${userId}: ${phase}`);
    }
    // ===============================================
    // ANALYTICS & INSIGHTS
    // ===============================================
    async getUserInsights(userId) {
        const memorySystem = await this.getOrCreateMemorySystem(userId);
        // Get memory counts
        const allMemories = await memorySystem.retrieveMemories(userId);
        const sacredMoments = await memorySystem.getSacredMoments(userId);
        const transformations = await memorySystem.retrieveMemories(userId, {
            transformations: true,
        });
        const threads = await memorySystem.getUserThreads(userId);
        const activeArchetypes = await memorySystem.getActiveArchetypes(userId);
        const journey = await memorySystem.getTransformationJourney(userId);
        // Extract patterns from recent memories
        const recentMemories = await memorySystem.retrieveMemories(userId, {
            limit: 20,
        });
        const recentPatterns = this.extractPatterns(recentMemories);
        // Get weekly reflection from Oracle if available
        let weeklyReflection;
        try {
            const oracle = await this.getOrCreateOracle(userId);
            if (oracle.offerWeeklyReflection) {
                weeklyReflection = await oracle.offerWeeklyReflection();
            }
        }
        catch (error) {
            logger_js_1.logger.debug("Weekly reflection not available");
        }
        return {
            memorySummary: {
                totalMemories: allMemories.length,
                sacredMoments: sacredMoments.length,
                transformationMarkers: transformations.length,
                activeThreads: threads.length,
            },
            recentPatterns,
            activeArchetypes,
            transformationPhase: journey.currentPhase,
            weeklyReflection,
        };
    }
    // ===============================================
    // HELPER METHODS
    // ===============================================
    detectElementFromResponse(response) {
        if (response.includes("🔥") || response.toLowerCase().includes("fire"))
            return "fire";
        if (response.includes("💧") || response.toLowerCase().includes("water"))
            return "water";
        if (response.includes("🌱") || response.toLowerCase().includes("earth"))
            return "earth";
        if (response.includes("🌬️") || response.toLowerCase().includes("air"))
            return "air";
        return "aether";
    }
    extractPatterns(memories) {
        // Simple pattern extraction
        const themes = new Map();
        memories.forEach((memory) => {
            if (memory.type === "oracle_exchange") {
                // Look for repeated themes in user content
                const words = memory.content.toLowerCase().split(/\s+/);
                words.forEach((word) => {
                    if (word.length > 5) {
                        themes.set(word, (themes.get(word) || 0) + 1);
                    }
                });
            }
        });
        return Array.from(themes.entries())
            .filter(([_, count]) => count >= 3) // Only themes that appear 3+ times
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([theme]) => theme);
    }
    // ===============================================
    // CLEANUP
    // ===============================================
    async cleanup() {
        // Close all database connections
        for (const [userId, memorySystem] of this.memorySystems) {
            await memorySystem.closeDatabase();
        }
        this.memorySystems.clear();
        this.oracles.clear();
        logger_js_1.logger.info("Soul Memory Service cleaned up");
    }
}
exports.SoulMemoryService = SoulMemoryService;
// Export singleton instance
exports.soulMemoryService = new SoulMemoryService();
exports.default = exports.soulMemoryService;
