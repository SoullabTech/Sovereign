import sqlite3 from "sqlite3";
import { readFileSync } from "fs";
import path from "path";

const dbPath = path.join(__dirname, "soullab.sqlite");
const schemaPath = path.join(__dirname, "schema.sql");

async function migrate() {
  const db = new sqlite3.Database(dbPath);
  const schema = readFileSync(schemaPath, "utf-8");

  db.serialize(() => {
    schema.split(";").forEach((stmt) => {
      if (stmt.trim()) {
        db.run(stmt.trim(), (err) => {
          if (err) {
            console.error("❌ Migration error:", err.message);
          }
        });
      }
    });
  });

  db.close(() => {
    console.log("✅ Soullab memory schema migrated successfully");
  });
}

migrate();