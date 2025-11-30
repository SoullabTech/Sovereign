// 📁 oracle-backend/src/lib/memoryStore.ts
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

const db = new Database("./oracle_memory.db");

// Initialize table
const init = () => {
  db.exec(`CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY,
    user TEXT,
    type TEXT,
    content TEXT,
    symbols TEXT,
    created_at TEXT
  )`);
};

init();

export const saveMemory = (
  user: string,
  type: string,
  content: string,
  symbols: string[] = [],
) => {
  const id = uuidv4();
  const stmt = db.prepare("INSERT INTO memories VALUES (?, ?, ?, ?, ?, ?)");
  stmt.run(
    id,
    user,
    type,
    content,
    JSON.stringify(symbols),
    new Date().toISOString(),
  );
  return id;
};

export const getMemories = (user: string, type?: string) => {
  const stmt = type
    ? db.prepare(
        "SELECT * FROM memories WHERE user = ? AND type = ? ORDER BY created_at DESC",
      )
    : db.prepare(
        "SELECT * FROM memories WHERE user = ? ORDER BY created_at DESC",
      );
  return stmt
    .all(user, type)
    .map((m) => ({ ...m, symbols: JSON.parse(m.symbols) }));
};

export const getMemoryById = (id: string) => {
  const stmt = db.prepare("SELECT * FROM memories WHERE id = ?");
  const mem = stmt.get(id);
  return mem ? { ...mem, symbols: JSON.parse(mem.symbols) } : null;
};
