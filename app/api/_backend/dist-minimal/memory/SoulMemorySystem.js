"use strict";
/**
 * Soul Memory System - Core Memory Management for Sacred AI
 * Unified interface for persistent spiritual memory across all services
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoulMemorySystem = void 0;
const sqlite3_1 = require("sqlite3");
const logger_1 = require("../src/utils/logger");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class SoulMemorySystem {
    constructor(config) {
        this.db = null;
        this.memoryCache = new Map();
        this.isInitialized = false;
        this.config = config;
    }
    /**
     * Initialize the memory system
     */
    async initialize() {
        if (this.isInitialized)
            return;
        if (this.config.storageType === 'sqlite') {
            await this.initializeSQLite();
        }
        this.isInitialized = true;
        logger_1.logger.info(`Soul Memory System initialized for user: ${this.config.userId}`);
    }
    /**
     * Initialize SQLite database
     */
    async initializeSQLite() {
        return new Promise((resolve, reject) => {
            const dbPath = this.config.databasePath || path_1.default.join(process.cwd(), 'soul_memory.db');
            // Ensure directory exists
            const dbDir = path_1.default.dirname(dbPath);
            if (!fs_1.default.existsSync(dbDir)) {
                fs_1.default.mkdirSync(dbDir, { recursive: true });
            }
            this.db = new sqlite3_1.Database(dbPath, (err) => {
                if (err) {
                    logger_1.logger.error('Failed to initialize SQLite database:', err);
                    reject(err);
                    return;
                }
                // Create tables
                this.createTables()
                    .then(() => resolve())
                    .catch(reject);
            });
        });
    }
    /**
     * Create database tables
     */
    async createTables() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const createMemoriesTable = `
        CREATE TABLE IF NOT EXISTS memories (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          content TEXT NOT NULL,
          element TEXT,
          emotional_tone TEXT,
          shadow_content BOOLEAN DEFAULT FALSE,
          transformation_marker BOOLEAN DEFAULT FALSE,
          sacred_moment BOOLEAN DEFAULT FALSE,
          spiral_phase TEXT,
          ritual_context TEXT,
          oracle_response TEXT,
          metadata TEXT,
          timestamp TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;
            const createIndexes = [
                'CREATE INDEX IF NOT EXISTS idx_user_id ON memories(user_id)',
                'CREATE INDEX IF NOT EXISTS idx_type ON memories(type)',
                'CREATE INDEX IF NOT EXISTS idx_timestamp ON memories(timestamp)',
                'CREATE INDEX IF NOT EXISTS idx_sacred ON memories(sacred_moment)',
                'CREATE INDEX IF NOT EXISTS idx_transformation ON memories(transformation_marker)'
            ];
            this.db.run(createMemoriesTable, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                // Create indexes
                Promise.all(createIndexes.map(indexQuery => new Promise((res, rej) => {
                    this.db.run(indexQuery, (indexErr) => {
                        if (indexErr)
                            rej(indexErr);
                        else
                            res();
                    });
                })))
                    .then(() => resolve())
                    .catch(reject);
            });
        });
    }
    /**
     * Store a memory
     */
    async storeMemory(memoryData) {
        await this.initialize();
        const memory = {
            id: this.generateId(),
            userId: memoryData.userId,
            type: memoryData.type,
            content: memoryData.content,
            element: memoryData.element,
            emotionalTone: memoryData.emotionalTone,
            shadowContent: memoryData.shadowContent || false,
            transformationMarker: memoryData.transformationMarker || false,
            sacredMoment: memoryData.sacredMoment || false,
            spiralPhase: memoryData.spiralPhase,
            ritualContext: memoryData.ritualContext,
            oracleResponse: memoryData.oracleResponse,
            metadata: memoryData.metadata || {},
            timestamp: new Date().toISOString(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        if (this.config.storageType === 'sqlite' && this.db) {
            await this.storeMemoryInSQLite(memory);
        }
        else {
            // In-memory storage
            const userMemories = this.memoryCache.get(memory.userId) || [];
            userMemories.push(memory);
            // Keep only the most recent memories based on memoryDepth
            if (userMemories.length > this.config.memoryDepth) {
                userMemories.splice(0, userMemories.length - this.config.memoryDepth);
            }
            this.memoryCache.set(memory.userId, userMemories);
        }
        logger_1.logger.info(`Stored memory: ${memory.type} for user ${memory.userId}`);
        return memory;
    }
    /**
     * Store memory in SQLite
     */
    async storeMemoryInSQLite(memory) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            const sql = `
        INSERT INTO memories (
          id, user_id, type, content, element, emotional_tone, 
          shadow_content, transformation_marker, sacred_moment,
          spiral_phase, ritual_context, oracle_response, metadata, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const values = [
                memory.id,
                memory.userId,
                memory.type,
                memory.content,
                memory.element,
                memory.emotionalTone,
                memory.shadowContent ? 1 : 0,
                memory.transformationMarker ? 1 : 0,
                memory.sacredMoment ? 1 : 0,
                memory.spiralPhase,
                memory.ritualContext,
                memory.oracleResponse,
                JSON.stringify(memory.metadata || {}),
                memory.timestamp
            ];
            this.db.run(sql, values, function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    /**
     * Retrieve memories for a user
     */
    async retrieveMemories(userId, options = {}) {
        await this.initialize();
        if (this.config.storageType === 'sqlite' && this.db) {
            return this.retrieveMemoriesFromSQLite(userId, options);
        }
        else {
            // In-memory retrieval
            const userMemories = this.memoryCache.get(userId) || [];
            let filtered = userMemories.filter(m => m.userId === userId);
            if (options.type) {
                filtered = filtered.filter(m => m.type === options.type);
            }
            if (options.element) {
                filtered = filtered.filter(m => m.element === options.element);
            }
            if (options.sacred) {
                filtered = filtered.filter(m => m.sacredMoment);
            }
            if (options.transformations) {
                filtered = filtered.filter(m => m.transformationMarker);
            }
            if (options.dateRange) {
                filtered = filtered.filter(m => {
                    const memoryDate = new Date(m.timestamp);
                    return memoryDate >= options.dateRange.start && memoryDate <= options.dateRange.end;
                });
            }
            // Sort by timestamp descending
            filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            if (options.limit) {
                filtered = filtered.slice(0, options.limit);
            }
            return filtered;
        }
    }
    /**
     * Retrieve memories from SQLite
     */
    async retrieveMemoriesFromSQLite(userId, options) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            let sql = 'SELECT * FROM memories WHERE user_id = ?';
            const params = [userId];
            if (options.type) {
                sql += ' AND type = ?';
                params.push(options.type);
            }
            if (options.element) {
                sql += ' AND element = ?';
                params.push(options.element);
            }
            if (options.sacred) {
                sql += ' AND sacred_moment = 1';
            }
            if (options.transformations) {
                sql += ' AND transformation_marker = 1';
            }
            if (options.dateRange) {
                sql += ' AND timestamp BETWEEN ? AND ?';
                params.push(options.dateRange.start.toISOString(), options.dateRange.end.toISOString());
            }
            sql += ' ORDER BY timestamp DESC';
            if (options.limit) {
                sql += ' LIMIT ?';
                params.push(options.limit);
            }
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const memories = rows.map(row => ({
                    id: row.id,
                    userId: row.user_id,
                    type: row.type,
                    content: row.content,
                    element: row.element,
                    emotionalTone: row.emotional_tone,
                    shadowContent: Boolean(row.shadow_content),
                    transformationMarker: Boolean(row.transformation_marker),
                    sacredMoment: Boolean(row.sacred_moment),
                    spiralPhase: row.spiral_phase,
                    ritualContext: row.ritual_context,
                    oracleResponse: row.oracle_response,
                    metadata: JSON.parse(row.metadata || '{}'),
                    timestamp: row.timestamp,
                    createdAt: new Date(row.created_at),
                    updatedAt: new Date(row.updated_at)
                }));
                resolve(memories);
            });
        });
    }
    /**
     * Get sacred moments for a user
     */
    async getSacredMoments(userId, limit = 10) {
        return this.retrieveMemories(userId, { sacred: true, limit });
    }
    /**
     * Record a ritual moment
     */
    async recordRitualMoment(userId, ritualType, content, element, oracleGuidance) {
        return this.storeMemory({
            userId,
            type: 'ritual_moment',
            content,
            element,
            ritualContext: ritualType,
            oracleResponse: oracleGuidance,
            sacredMoment: true
        });
    }
    /**
     * Mark a transformation
     */
    async markTransformation(memoryId, transformationType, insights) {
        // In a full implementation, this would update the existing memory
        logger_1.logger.info(`Marked transformation for memory ${memoryId}: ${transformationType}`);
    }
    /**
     * Get active archetypes for a user
     */
    async getActiveArchetypes(userId) {
        const memories = await this.retrieveMemories(userId, { limit: 50 });
        // Simple archetype detection based on content patterns
        const archetypePatterns = {
            'Shadow': ['shadow', 'dark', 'rejected', 'hidden'],
            'Seeker': ['seeking', 'searching', 'quest', 'journey'],
            'Warrior': ['fight', 'struggle', 'strength', 'courage'],
            'Sage': ['wisdom', 'understanding', 'knowledge', 'insight']
        };
        const archetypeCounts = {};
        memories.forEach(memory => {
            const content = memory.content.toLowerCase();
            Object.entries(archetypePatterns).forEach(([archetype, patterns]) => {
                const matches = patterns.filter(pattern => content.includes(pattern)).length;
                if (matches > 0) {
                    archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + matches;
                }
            });
        });
        return Object.entries(archetypeCounts)
            .map(([archetype, count]) => ({
            archetype,
            strength: count / memories.length,
            occurrences: count
        }))
            .sort((a, b) => b.strength - a.strength);
    }
    /**
     * Get transformation journey for a user
     */
    async getTransformationJourney(userId) {
        const transformationMemories = await this.retrieveMemories(userId, {
            transformations: true,
            limit: 20
        });
        return {
            currentPhase: transformationMemories.length > 0 ? 'Integration Phase' : 'Beginning Phase',
            milestones: transformationMemories,
            progressMetrics: {
                totalTransformations: transformationMemories.length,
                recentActivity: transformationMemories.filter(m => new Date(m.timestamp).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000)).length
            }
        };
    }
    /**
     * Semantic search (placeholder for LlamaIndex integration)
     */
    async semanticSearch(userId, query, options = {}) {
        // Simple keyword-based search for now
        const allMemories = await this.retrieveMemories(userId, {
            limit: options.topK || 10
        });
        const keywords = query.toLowerCase().split(/\s+/);
        return allMemories.filter(memory => {
            const content = memory.content.toLowerCase();
            return keywords.some(keyword => content.includes(keyword));
        });
    }
    /**
     * Create memory thread for journey tracking
     */
    async createMemoryThread(userId, threadName, threadType) {
        // Placeholder implementation
        const threadId = this.generateId();
        logger_1.logger.info(`Created memory thread: ${threadName} for user ${userId}`);
        return {
            id: threadId,
            name: threadName,
            type: threadType
        };
    }
    /**
     * Get user threads
     */
    async getUserThreads(userId) {
        // Placeholder implementation
        return [];
    }
    /**
     * Get memory thread
     */
    async getMemoryThread(threadId) {
        // Placeholder implementation
        return null;
    }
    /**
     * Integrate with Oracle (placeholder)
     */
    async integrateWithOracle(oracle, userId) {
        logger_1.logger.info(`Integrated oracle with memory system for user: ${userId}`);
    }
    /**
     * Close database connection
     */
    async closeDatabase() {
        return new Promise((resolve) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        logger_1.logger.error('Error closing database:', err);
                    }
                    else {
                        logger_1.logger.info('Database connection closed');
                    }
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.SoulMemorySystem = SoulMemorySystem;
// Export for backward compatibility
exports.default = SoulMemorySystem;
