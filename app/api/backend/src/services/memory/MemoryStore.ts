// @ts-nocheck
import Database from "better-sqlite3";

export class MemoryStore {
  private db!: Database.Database;
  private _isInitialized = false;

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  async init(dbPath: string) {
    this.db = new Database(dbPath);
    
    // Initialize daimonic encounters table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS daimonic_encounters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        encounter_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        symbol TEXT NOT NULL,
        message TEXT NOT NULL,
        action_prompt TEXT NOT NULL,
        archetype TEXT NOT NULL,
        energy_state TEXT NOT NULL,
        trigger_context TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_daimonic_encounters_user_id ON daimonic_encounters(user_id);
      CREATE INDEX IF NOT EXISTS idx_daimonic_encounters_timestamp ON daimonic_encounters(user_id, timestamp DESC);
    `);
    
    this._isInitialized = true;
    return this;
  }

  async addMemory(userId: string, type: string, referenceId: number, content: string) {
    const stmt = this.db.prepare("INSERT INTO memories (user_id, memory_type, reference_id, content) VALUES (?, ?, ?, ?)");
    stmt.run(userId, type, referenceId, content);
  }

  async getMemories(userId: string, limit = 20) {
    const stmt = this.db.prepare("SELECT * FROM memories WHERE user_id = ? ORDER BY created_at DESC LIMIT ?");
    return stmt.all(userId, limit);
  }

  async saveJournalEntry(userId: string, title: string, content: string, mood?: string, tags?: string[]) {
    const stmt = this.db.prepare("INSERT INTO journal_entries (user_id, title, content, mood, tags) VALUES (?, ?, ?, ?, ?)");
    const result = stmt.run(userId, title, content, mood, tags?.join(','));
    return `journal_${result.lastInsertRowid}`;
  }

  async getJournalEntries(userId: string, limit = 20, offset = 0) {
    const stmt = this.db.prepare("SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?");
    return stmt.all(userId, limit, offset);
  }

  async saveUpload(userId: string, filename: string, extractedContent: string, metadata?: any) {
    const stmt = this.db.prepare("INSERT INTO uploads (user_id, filename, file_type, summary, extracted_content, metadata) VALUES (?, ?, ?, ?, ?, ?)");
    const result = stmt.run(userId, filename, metadata?.fileType || 'unknown', extractedContent.slice(0, 200), extractedContent, JSON.stringify(metadata));
    return `upload_${result.lastInsertRowid}`;
  }

  async addVoiceNote(userId: string, transcript: string, audioPath?: string, durationSeconds?: number) {
    const stmt = this.db.prepare("INSERT INTO voice_notes (user_id, transcript, audio_path, duration_seconds) VALUES (?, ?, ?, ?)");
    const result = stmt.run(userId, transcript, audioPath, durationSeconds);
    return result.lastInsertRowid;
  }

  async getVoiceNotes(userId: string, limit = 20, offset = 0) {
    const stmt = this.db.prepare("SELECT * FROM voice_notes WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?");
    return stmt.all(userId, limit, offset);
  }

  async getVoiceNote(voiceNoteId: number) {
    const stmt = this.db.prepare("SELECT * FROM voice_notes WHERE id = ?");
    return stmt.get(voiceNoteId);
  }

  async deleteVoiceNote(voiceNoteId: number) {
    const stmt = this.db.prepare("DELETE FROM voice_notes WHERE id = ?");
    return stmt.run(voiceNoteId);
  }

  async searchMemories(userId: string, searchTerm: string, memoryType?: string) {
    const typeFilter = memoryType ? "AND memory_type = ?" : "";
    const params = memoryType ? [userId, `%${searchTerm}%`, memoryType] : [userId, `%${searchTerm}%`];

    const stmt = this.db.prepare(`SELECT * FROM memories WHERE user_id = ? AND content LIKE ? ${typeFilter} ORDER BY created_at DESC LIMIT 50`);
    return stmt.all(...params);
  }

  async getTrustMetrics(userId: string): Promise<any> {
    const stmt = this.db.prepare("SELECT * FROM user_trust_metrics WHERE user_id = ?");
    const result = stmt.get(userId);
    return result ? JSON.parse(result.metrics_json) : null;
  }

  async saveTrustMetrics(metrics: any): Promise<void> {
    const stmt = this.db.prepare(`INSERT OR REPLACE INTO user_trust_metrics (user_id, trust_score, session_count, metrics_json, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`);
    stmt.run(metrics.userId, metrics.trustScore, metrics.sessionCount, JSON.stringify(metrics));
  }

  async getTrustHistory(userId: string, days: number): Promise<any[]> {
    const stmt = this.db.prepare(`SELECT * FROM trust_history
       WHERE user_id = ? AND created_at > datetime('now', '-${days} days')
       ORDER BY created_at DESC`);
    return stmt.all(userId);
  }

  // Additional methods for journal and upload APIs
  async getJournalEntry(userId: string, entryId: string): Promise<any> {
    const id = entryId.replace('journal_', '');
    const stmt = this.db.prepare("SELECT * FROM journal_entries WHERE user_id = ? AND id = ?");
    return stmt.get(userId, id);
  }

  async getJournalEntriesByIds(userId: string, entryIds: string[]): Promise<any[]> {
    const ids = entryIds.map(id => id.replace('journal_', '')).join(',');
    const stmt = this.db.prepare(`SELECT * FROM journal_entries WHERE user_id = ? AND id IN (${ids})`);
    return stmt.all(userId);
  }

  async getUploads(userId: string, limit = 20, fileType?: string): Promise<any[]> {
    if (fileType) {
      const stmt = this.db.prepare("SELECT * FROM uploads WHERE user_id = ? AND file_type = ? ORDER BY created_at DESC LIMIT ?");
      return stmt.all(userId, fileType, limit);
    }
    const stmt = this.db.prepare("SELECT * FROM uploads WHERE user_id = ? ORDER BY created_at DESC LIMIT ?");
    return stmt.all(userId, limit);
  }

  async getUpload(userId: string, uploadId: string): Promise<any> {
    const id = uploadId.replace('upload_', '');
    const stmt = this.db.prepare("SELECT * FROM uploads WHERE user_id = ? AND id = ?");
    return stmt.get(userId, id);
  }

  // Daimonic encounter methods
  async saveDaimonicEncounter(encounter: any): Promise<string> {
    const stmt = this.db.prepare(`INSERT INTO daimonic_encounters
       (user_id, encounter_id, title, symbol, message, action_prompt, archetype, energy_state, trigger_context, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(
      encounter.userId,
      encounter.id,
      encounter.title,
      encounter.symbol,
      encounter.message,
      encounter.actionPrompt,
      encounter.archetype,
      encounter.energyState,
      JSON.stringify(encounter.triggerContext),
      encounter.timestamp
    );
    return encounter.id;
  }

  async getDaimonicEncounters(userId: string, limit = 20): Promise<any[]> {
    const stmt = this.db.prepare("SELECT * FROM daimonic_encounters WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?");
    const rows = stmt.all(userId, limit);

    // Parse trigger context JSON
    return rows.map(row => ({
      ...row,
      triggerContext: JSON.parse(row.trigger_context || '{}')
    }));
  }

  async getLastDaimonicEncounter(userId: string): Promise<any> {
    const stmt = this.db.prepare("SELECT * FROM daimonic_encounters WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1");
    const row = stmt.get(userId);

    if (row) {
      return {
        ...row,
        triggerContext: JSON.parse(row.trigger_context || '{}')
      };
    }
    return null;
  }

  async getDaimonicEncounter(userId: string, encounterId: string): Promise<any> {
    const stmt = this.db.prepare("SELECT * FROM daimonic_encounters WHERE user_id = ? AND encounter_id = ?");
    const row = stmt.get(userId, encounterId);

    if (row) {
      return {
        ...row,
        triggerContext: JSON.parse(row.trigger_context || '{}')
      };
    }
    return null;
  }
}

// Export singleton instance
export const memoryStore = new MemoryStore();