// @ts-nocheck
import Database from "better-sqlite3";
import { readFileSync, existsSync } from "fs";
import path from "path";

const dbPath = path.join(__dirname, "soullab.sqlite");
const schemaPath = path.join(__dirname, "schema.sql");

async function migrate() {
  try {
    const db = new Database(dbPath);

    // Create essential tables if schema file doesn't exist
    if (!existsSync(schemaPath)) {
      console.log("⚡ Creating default memory tables...");

      const defaultSchema = `
        CREATE TABLE IF NOT EXISTS memories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          memory_type TEXT NOT NULL,
          reference_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS journal_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          mood TEXT,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS uploads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          filename TEXT NOT NULL,
          file_type TEXT NOT NULL,
          summary TEXT,
          extracted_content TEXT,
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS voice_notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          transcript TEXT NOT NULL,
          audio_path TEXT,
          duration_seconds INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS user_trust_metrics (
          user_id TEXT PRIMARY KEY,
          trust_score REAL NOT NULL,
          session_count INTEGER NOT NULL,
          metrics_json TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS trust_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
        CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
        CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
        CREATE INDEX IF NOT EXISTS idx_voice_notes_user_id ON voice_notes(user_id);
      `;

      defaultSchema.split(";").forEach((stmt) => {
        if (stmt.trim()) {
          try {
            db.exec(stmt.trim());
          } catch (err) {
            console.error("❌ Migration error:", err.message);
          }
        }
      });
    } else {
      const schema = readFileSync(schemaPath, "utf-8");
      schema.split(";").forEach((stmt) => {
        if (stmt.trim()) {
          try {
            db.exec(stmt.trim());
          } catch (err) {
            console.error("❌ Migration error:", err.message);
          }
        }
      });
    }

    db.close();
    console.log("✅ Soullab memory schema migrated successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();