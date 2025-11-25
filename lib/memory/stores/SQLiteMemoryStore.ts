/**
 * SQLite Memory Store Implementation
 * File-based storage for development and single-instance deployments
 */

import Database from 'better-sqlite3';
import path from 'path';
import { 
  MemoryStore, 
  CoreMemory, 
  WorkingMemory, 
  RecallMemory, 
  ArchivalMemory 
} from '../core/MemoryCore';

export class SQLiteMemoryStore implements MemoryStore {
  private db: Database.Database;
  
  constructor(dbPath?: string) {
    const defaultPath = path.join(process.cwd(), 'data', 'soul_memory.db');
    this.db = new Database(dbPath || defaultPath);
    this.initialize();
  }
  
  private initialize() {
    // Core memory table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS core_memory (
        user_id TEXT PRIMARY KEY,
        human_data TEXT NOT NULL,
        persona_data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Working memory table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS working_memory (
        conversation_id TEXT PRIMARY KEY,
        messages TEXT NOT NULL,
        current_topic TEXT,
        emotional_context TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Recall memory table with vector storage
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS recall_memory (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT,
        embedding BLOB,
        timestamp DATETIME NOT NULL,
        associations TEXT,
        emotional_signature TEXT,
        importance INTEGER,
        access_count INTEGER DEFAULT 0,
        last_accessed DATETIME,
        metadata TEXT,
        FOREIGN KEY (user_id) REFERENCES core_memory(user_id)
      )
    `);
    
    // Create indexes for efficient searching
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_recall_user_type 
      ON recall_memory(user_id, type);
      
      CREATE INDEX IF NOT EXISTS idx_recall_timestamp 
      ON recall_memory(timestamp);
      
      CREATE INDEX IF NOT EXISTS idx_recall_importance 
      ON recall_memory(importance DESC);
    `);
    
    // Archival memory table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS archival_memory (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        period_start DATETIME NOT NULL,
        period_end DATETIME NOT NULL,
        summary TEXT,
        key_insights TEXT,
        dominant_themes TEXT,
        elemental_balance TEXT,
        emotional_journey TEXT,
        compressed_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES core_memory(user_id)
      )
    `);
    
    // Memory associations table (many-to-many)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memory_associations (
        memory_id TEXT NOT NULL,
        associated_id TEXT NOT NULL,
        strength REAL DEFAULT 0.5,
        PRIMARY KEY (memory_id, associated_id),
        FOREIGN KEY (memory_id) REFERENCES recall_memory(id),
        FOREIGN KEY (associated_id) REFERENCES recall_memory(id)
      )
    `);
  }
  
  // Core Memory Operations
  async getCoreMemory(userId: string): Promise<CoreMemory> {
    const stmt = this.db.prepare(`
      SELECT human_data, persona_data 
      FROM core_memory 
      WHERE user_id = ?
    `);
    
    const row = stmt.get(userId) as any;
    
    if (!row) {
      throw new Error(`Core memory not found for user ${userId}`);
    }
    
    return {
      human: JSON.parse(row.human_data),
      persona: JSON.parse(row.persona_data)
    };
  }
  
  async updateCoreMemory(userId: string, updates: Partial<CoreMemory>): Promise<void> {
    const existing = await this.getCoreMemory(userId).catch(() => null);
    
    const merged = existing ? {
      human: { ...existing.human, ...(updates.human || {}) },
      persona: { ...existing.persona, ...(updates.persona || {}) }
    } : updates as CoreMemory;
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO core_memory (user_id, human_data, persona_data, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(
      userId,
      JSON.stringify(merged.human),
      JSON.stringify(merged.persona)
    );
  }
  
  // Working Memory Operations
  async getWorkingMemory(conversationId: string): Promise<WorkingMemory> {
    const stmt = this.db.prepare(`
      SELECT messages, current_topic, emotional_context
      FROM working_memory
      WHERE conversation_id = ?
    `);
    
    const row = stmt.get(conversationId) as any;
    
    if (!row) {
      // Return empty working memory if not found
      return {
        conversationId,
        messages: [],
        currentTopic: '',
        emotionalContext: {
          mood: 'neutral',
          energy: 'emerging',
          intensity: 50
        }
      };
    }
    
    return {
      conversationId,
      messages: JSON.parse(row.messages),
      currentTopic: row.current_topic || '',
      emotionalContext: JSON.parse(row.emotional_context)
    };
  }
  
  async updateWorkingMemory(conversationId: string, memory: WorkingMemory): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO working_memory 
      (conversation_id, messages, current_topic, emotional_context, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(
      conversationId,
      JSON.stringify(memory.messages),
      memory.currentTopic,
      JSON.stringify(memory.emotionalContext)
    );
  }
  
  async clearWorkingMemory(conversationId: string): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM working_memory WHERE conversation_id = ?
    `);
    
    stmt.run(conversationId);
  }
  
  // Recall Memory Operations
  async addRecallMemory(memory: RecallMemory): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO recall_memory (
        id, user_id, type, content, summary, embedding,
        timestamp, associations, emotional_signature,
        importance, access_count, last_accessed, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      memory.id,
      memory.userId,
      memory.type,
      memory.content,
      memory.summary,
      Buffer.from(new Float32Array(memory.embedding).buffer),
      memory.timestamp.toISOString(),
      JSON.stringify(memory.associations),
      JSON.stringify(memory.emotionalSignature),
      memory.importance,
      memory.accessCount,
      memory.lastAccessed.toISOString(),
      JSON.stringify(memory.metadata)
    );
    
    // Store associations
    if (memory.associations.length > 0) {
      const assocStmt = this.db.prepare(`
        INSERT OR IGNORE INTO memory_associations (memory_id, associated_id, strength)
        VALUES (?, ?, ?)
      `);
      
      for (const associatedId of memory.associations) {
        assocStmt.run(memory.id, associatedId, 0.5);
      }
    }
  }
  
  async searchRecallMemory(query: {
    userId: string;
    embedding?: number[];
    type?: RecallMemory['type'];
    startDate?: Date;
    endDate?: Date;
    minImportance?: number;
    limit?: number;
  }): Promise<RecallMemory[]> {
    let sql = `
      SELECT id, user_id, type, content, summary, embedding,
             timestamp, associations, emotional_signature,
             importance, access_count, last_accessed, metadata
      FROM recall_memory
      WHERE user_id = ?
    `;
    
    const params: any[] = [query.userId];
    
    if (query.type) {
      sql += ' AND type = ?';
      params.push(query.type);
    }
    
    if (query.startDate) {
      sql += ' AND timestamp >= ?';
      params.push(query.startDate.toISOString());
    }
    
    if (query.endDate) {
      sql += ' AND timestamp <= ?';
      params.push(query.endDate.toISOString());
    }
    
    if (query.minImportance) {
      sql += ' AND importance >= ?';
      params.push(query.minImportance);
    }
    
    // If embedding provided, we'll sort by similarity after fetching
    sql += ' ORDER BY importance DESC, timestamp DESC';
    sql += ` LIMIT ${query.limit || 100}`;
    
    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    
    let memories = rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      content: row.content,
      summary: row.summary,
      embedding: Array.from(new Float32Array(row.embedding)),
      timestamp: new Date(row.timestamp),
      associations: JSON.parse(row.associations),
      emotionalSignature: JSON.parse(row.emotional_signature),
      importance: row.importance,
      accessCount: row.access_count,
      lastAccessed: new Date(row.last_accessed),
      metadata: JSON.parse(row.metadata)
    }));
    
    // Sort by embedding similarity if provided
    if (query.embedding) {
      memories = memories.sort((a, b) => {
        const simA = this.cosineSimilarity(query.embedding!, a.embedding);
        const simB = this.cosineSimilarity(query.embedding!, b.embedding);
        return simB - simA;
      });
      
      memories = memories.slice(0, query.limit || 100);
    }
    
    return memories;
  }
  
  async updateRecallImportance(memoryId: string, importance: number): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE recall_memory 
      SET importance = ?, 
          access_count = access_count + 1,
          last_accessed = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(importance, memoryId);
  }
  
  // Archival Memory Operations
  async archiveMemories(userId: string, startDate: Date, endDate: Date): Promise<void> {
    // Fetch memories to archive
    const memories = await this.searchRecallMemory({
      userId,
      startDate,
      endDate,
      limit: 1000
    });
    
    if (memories.length === 0) return;
    
    // Generate summary and insights
    const summary = this.generateArchivalSummary(memories);
    const insights = this.extractKeyInsights(memories);
    const themes = this.extractDominantThemes(memories);
    const elementalBalance = this.calculateElementalBalance(memories);
    const emotionalJourney = this.mapEmotionalJourney(memories);
    
    // Create archival entry
    const archiveStmt = this.db.prepare(`
      INSERT INTO archival_memory (
        id, user_id, period_start, period_end,
        summary, key_insights, dominant_themes,
        elemental_balance, emotional_journey, compressed_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const archiveId = `archive_${Date.now()}`;
    
    archiveStmt.run(
      archiveId,
      userId,
      startDate.toISOString(),
      endDate.toISOString(),
      summary,
      JSON.stringify(insights),
      JSON.stringify(themes),
      JSON.stringify(elementalBalance),
      JSON.stringify(emotionalJourney),
      JSON.stringify(memories) // Compressed data
    );
    
    // Delete archived memories from recall table
    const deleteStmt = this.db.prepare(`
      DELETE FROM recall_memory 
      WHERE user_id = ? 
      AND timestamp >= ? 
      AND timestamp <= ?
    `);
    
    deleteStmt.run(userId, startDate.toISOString(), endDate.toISOString());
  }
  
  async getArchivalSummary(
    userId: string, 
    period?: {start: Date; end: Date}
  ): Promise<ArchivalMemory[]> {
    let sql = `
      SELECT * FROM archival_memory
      WHERE user_id = ?
    `;
    
    const params: any[] = [userId];
    
    if (period) {
      sql += ' AND period_start >= ? AND period_end <= ?';
      params.push(period.start.toISOString(), period.end.toISOString());
    }
    
    sql += ' ORDER BY period_start DESC';
    
    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    
    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      period: {
        start: new Date(row.period_start),
        end: new Date(row.period_end)
      },
      summary: row.summary,
      keyInsights: JSON.parse(row.key_insights),
      dominantThemes: JSON.parse(row.dominant_themes),
      elementalBalance: JSON.parse(row.elemental_balance),
      emotionalJourney: JSON.parse(row.emotional_journey),
      compressedData: row.compressed_data
    }));
  }
  
  // Helper methods
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  private generateArchivalSummary(memories: RecallMemory[]): string {
    const types = memories.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return `Archived ${memories.length} memories: ${Object.entries(types)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ')}`;
  }
  
  private extractKeyInsights(memories: RecallMemory[]): string[] {
    return memories
      .filter(m => m.type === 'insight' || m.importance > 80)
      .map(m => m.summary)
      .slice(0, 5);
  }
  
  private extractDominantThemes(memories: RecallMemory[]): string[] {
    // Simple word frequency analysis
    const words: Record<string, number> = {};
    memories.forEach(m => {
      const tokens = m.content.toLowerCase().split(/\W+/);
      tokens.forEach(token => {
        if (token.length > 4) {
          words[token] = (words[token] || 0) + 1;
        }
      });
    });
    
    return Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }
  
  private calculateElementalBalance(memories: RecallMemory[]): Record<string, number> {
    const elements: Record<string, number> = {
      air: 0, fire: 0, water: 0, earth: 0, aether: 0
    };
    
    memories.forEach(m => {
      const element = m.emotionalSignature.element;
      elements[element] = (elements[element] || 0) + 1;
    });
    
    const total = memories.length || 1;
    Object.keys(elements).forEach(key => {
      elements[key] = (elements[key] / total) * 100;
    });
    
    return elements;
  }
  
  private mapEmotionalJourney(memories: RecallMemory[]): Array<any> {
    return memories.map(m => ({
      date: m.timestamp,
      mood: m.emotionalSignature.mood,
      energy: m.emotionalSignature.energy
    }));
  }
  
  // Cleanup
  close() {
    this.db.close();
  }
}