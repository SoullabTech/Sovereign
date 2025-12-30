// Update Soul Memory Database Schema
const Database = require("better-sqlite3");

console.log("🛠️ Updating Soul Memory Database Schema...\n");

try {
  const db = new Database("./soul_memory.db");

  // Drop existing table if it exists with wrong schema
  console.log("1️⃣ Dropping old table...");
  db.exec("DROP TABLE IF EXISTS soul_memory");

  // Create new memories table with correct schema
  console.log("2️⃣ Creating new memories table...");
  db.exec(`
    CREATE TABLE memories (
      id VARCHAR PRIMARY KEY,
      user_id VARCHAR NOT NULL,
      timestamp DATETIME NOT NULL,
      type VARCHAR NOT NULL,
      content TEXT NOT NULL,
      element VARCHAR,
      archetype VARCHAR,
      spiral_phase VARCHAR,
      emotional_tone VARCHAR,
      shadow_content BOOLEAN DEFAULT FALSE,
      transformation_marker BOOLEAN DEFAULT FALSE,
      sacred_moment BOOLEAN DEFAULT FALSE,
      ritual_context VARCHAR,
      oracle_response TEXT,
      metadata TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create memory threads table
  console.log("3️⃣ Creating memory_threads table...");
  db.exec(`
    CREATE TABLE memory_threads (
      id VARCHAR PRIMARY KEY,
      user_id VARCHAR NOT NULL,
      thread_name VARCHAR NOT NULL,
      thread_type VARCHAR NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      memories TEXT,
      state TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create archetypal patterns table
  console.log("4️⃣ Creating archetypal_patterns table...");
  db.exec(`
    CREATE TABLE archetypal_patterns (
      id VARCHAR PRIMARY KEY,
      user_id VARCHAR NOT NULL,
      archetype VARCHAR NOT NULL,
      activation_count INTEGER DEFAULT 1,
      last_activated DATETIME DEFAULT CURRENT_TIMESTAMP,
      pattern_strength REAL DEFAULT 0.0,
      related_memories TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create indexes for performance
  console.log("5️⃣ Creating performance indexes...");
  db.exec("CREATE INDEX idx_memories_user_id ON memories(user_id)");
  db.exec("CREATE INDEX idx_memories_type ON memories(type)");
  db.exec("CREATE INDEX idx_memories_timestamp ON memories(timestamp)");
  db.exec("CREATE INDEX idx_memories_sacred ON memories(sacred_moment)");
  db.exec("CREATE INDEX idx_threads_user_id ON memory_threads(user_id)");
  db.exec("CREATE INDEX idx_patterns_user_id ON archetypal_patterns(user_id)");

  // Verify tables
  console.log("6️⃣ Verifying schema...");
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all();
  console.log("📋 Created tables:", tables.map((t) => t.name).join(", "));

  const memoriesSchema = db.prepare("PRAGMA table_info(memories)").all();
  console.log("✅ Memories table columns:");
  memoriesSchema.forEach((col) =>
    console.log(`   - ${col.name} (${col.type})`),
  );

  db.close();
  console.log("\n✅ Database schema updated successfully!");
} catch (error) {
  console.error("❌ Error updating schema:", error.message);
}
