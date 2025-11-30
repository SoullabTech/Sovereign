/**
 * Soul Memory System - Core Memory Management for Sacred AI
 * Unified interface for persistent spiritual memory across all services
 */

import { Database } from 'sqlite3';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

// Core types for memory system
export type MemoryType = 
  | 'oracle_exchange' 
  | 'journal_entry' 
  | 'ritual_moment' 
  | 'breakthrough' 
  | 'shadow_work'
  | 'voice_journal'
  | 'semantic_pattern';

export type ElementalType = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export interface Memory {
  id: string;
  userId: string;
  type: MemoryType;
  content: string;
  element?: ElementalType;
  emotionalTone?: string;
  shadowContent?: boolean;
  transformationMarker?: boolean;
  sacredMoment?: boolean;
  spiralPhase?: string;
  ritualContext?: string;
  oracleResponse?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoulMemoryConfig {
  userId: string;
  storageType: 'sqlite' | 'memory';
  databasePath?: string;
  memoryDepth: number;
}

export class SoulMemorySystem {
  private db: Database | null = null;
  private config: SoulMemoryConfig;
  private memoryCache: Map<string, Memory[]> = new Map();
  private isInitialized = false;

  constructor(config: SoulMemoryConfig) {
    this.config = config;
  }

  /**
   * Initialize the memory system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.config.storageType === 'sqlite') {
      await this.initializeSQLite();
    }
    
    this.isInitialized = true;
    logger.info(`Soul Memory System initialized for user: ${this.config.userId}`);
  }

  /**
   * Initialize SQLite database
   */
  private async initializeSQLite(): Promise<void> {
    return new Promise((resolve, reject) => {
      const dbPath = this.config.databasePath || path.join(process.cwd(), 'soul_memory.db');
      
      // Ensure directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new Database(dbPath, (err) => {
        if (err) {
          logger.error('Failed to initialize SQLite database:', err);
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
  private async createTables(): Promise<void> {
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
        Promise.all(createIndexes.map(indexQuery => new Promise<void>((res, rej) => {
          this.db!.run(indexQuery, (indexErr) => {
            if (indexErr) rej(indexErr);
            else res();
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
  async storeMemory(memoryData: Partial<Memory> & { userId: string; type: MemoryType; content: string }): Promise<Memory> {
    await this.initialize();

    const memory: Memory = {
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
    } else {
      // In-memory storage
      const userMemories = this.memoryCache.get(memory.userId) || [];
      userMemories.push(memory);
      
      // Keep only the most recent memories based on memoryDepth
      if (userMemories.length > this.config.memoryDepth) {
        userMemories.splice(0, userMemories.length - this.config.memoryDepth);
      }
      
      this.memoryCache.set(memory.userId, userMemories);
    }

    logger.info(`Stored memory: ${memory.type} for user ${memory.userId}`);
    return memory;
  }

  /**
   * Store memory in SQLite
   */
  private async storeMemoryInSQLite(memory: Memory): Promise<void> {
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

      this.db.run(sql, values, function(err) {
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
  async retrieveMemories(
    userId: string, 
    options: {
      type?: MemoryType;
      element?: ElementalType;
      limit?: number;
      sacred?: boolean;
      transformations?: boolean;
      dateRange?: { start: Date; end: Date };
    } = {}
  ): Promise<Memory[]> {
    await this.initialize();

    if (this.config.storageType === 'sqlite' && this.db) {
      return this.retrieveMemoriesFromSQLite(userId, options);
    } else {
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
          return memoryDate >= options.dateRange!.start && memoryDate <= options.dateRange!.end;
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
  private async retrieveMemoriesFromSQLite(userId: string, options: any): Promise<Memory[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      let sql = 'SELECT * FROM memories WHERE user_id = ?';
      const params: any[] = [userId];

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

      this.db.all(sql, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const memories: Memory[] = rows.map(row => ({
          id: row.id,
          userId: row.user_id,
          type: row.type as MemoryType,
          content: row.content,
          element: row.element as ElementalType,
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
  async getSacredMoments(userId: string, limit: number = 10): Promise<Memory[]> {
    return this.retrieveMemories(userId, { sacred: true, limit });
  }

  /**
   * Record a ritual moment
   */
  async recordRitualMoment(
    userId: string,
    ritualType: string,
    content: string,
    element: ElementalType,
    oracleGuidance?: string
  ): Promise<Memory> {
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
  async markTransformation(memoryId: string, transformationType: string, insights: string): Promise<void> {
    // In a full implementation, this would update the existing memory
    logger.info(`Marked transformation for memory ${memoryId}: ${transformationType}`);
  }

  /**
   * Get active archetypes for a user
   */
  async getActiveArchetypes(userId: string): Promise<any[]> {
    const memories = await this.retrieveMemories(userId, { limit: 50 });
    
    // Simple archetype detection based on content patterns
    const archetypePatterns = {
      'Shadow': ['shadow', 'dark', 'rejected', 'hidden'],
      'Seeker': ['seeking', 'searching', 'quest', 'journey'],
      'Warrior': ['fight', 'struggle', 'strength', 'courage'],
      'Sage': ['wisdom', 'understanding', 'knowledge', 'insight']
    };

    const archetypeCounts: Record<string, number> = {};

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
  async getTransformationJourney(userId: string): Promise<{
    currentPhase: string;
    milestones: Memory[];
    progressMetrics: any;
  }> {
    const transformationMemories = await this.retrieveMemories(userId, { 
      transformations: true,
      limit: 20 
    });

    return {
      currentPhase: transformationMemories.length > 0 ? 'Integration Phase' : 'Beginning Phase',
      milestones: transformationMemories,
      progressMetrics: {
        totalTransformations: transformationMemories.length,
        recentActivity: transformationMemories.filter(m => 
          new Date(m.timestamp).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000)
        ).length
      }
    };
  }

  /**
   * Semantic search (placeholder for LlamaIndex integration)
   */
  async semanticSearch(
    userId: string, 
    query: string, 
    options: {
      topK?: number;
      memoryTypes?: MemoryType[];
      includeArchetypal?: boolean;
    } = {}
  ): Promise<Memory[]> {
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
  async createMemoryThread(
    userId: string,
    threadName: string,
    threadType: "ritual" | "shadow_work" | "transformation" | "integration"
  ): Promise<{ id: string; name: string; type: string }> {
    // Placeholder implementation
    const threadId = this.generateId();
    logger.info(`Created memory thread: ${threadName} for user ${userId}`);
    
    return {
      id: threadId,
      name: threadName,
      type: threadType
    };
  }

  /**
   * Get user threads
   */
  async getUserThreads(userId: string): Promise<any[]> {
    // Placeholder implementation
    return [];
  }

  /**
   * Get memory thread
   */
  async getMemoryThread(threadId: string): Promise<any | null> {
    // Placeholder implementation
    return null;
  }

  /**
   * Integrate with Oracle (placeholder)
   */
  async integrateWithOracle(oracle: any, userId: string): Promise<void> {
    logger.info(`Integrated oracle with memory system for user: ${userId}`);
  }

  /**
   * Close database connection
   */
  async closeDatabase(): Promise<void> {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            logger.error('Error closing database:', err);
          } else {
            logger.info('Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export for backward compatibility
export default SoulMemorySystem;