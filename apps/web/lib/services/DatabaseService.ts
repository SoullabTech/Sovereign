/**
 * Unified Database Service
 * Consolidates SQLite, Supabase, and other database operations
 * Provides consistent data access layer across the platform
 */

import { IDatabaseService, DatabaseTransaction } from '../core/ServiceTokens';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

export interface DatabaseConfig {
  url: string;
  pool?: {
    min: number;
    max: number;
  };
  enableMigrations: boolean;
  enableQueryLogging: boolean;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  affectedRows?: number;
}

export class DatabaseService implements IDatabaseService {
  private db: Database | null = null;
  private config: DatabaseConfig;
  private isInitialized = false;

  constructor(config: DatabaseConfig) {
    this.config = {
      enableMigrations: true,
      enableQueryLogging: process.env.NODE_ENV === 'development',
      ...config
    };
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Parse database URL (simplified - supports SQLite)
      const dbPath = this.config.url.replace('sqlite://', '').replace('sqlite3://', '');
      
      this.db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Enable foreign keys and other pragmas
      await this.db.exec('PRAGMA foreign_keys = ON');
      await this.db.exec('PRAGMA journal_mode = WAL'); // Write-Ahead Logging
      
      if (this.config.enableMigrations) {
        await this.runMigrations();
      }

      this.isInitialized = true;
      console.log('✅ Database initialized successfully');

    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute a SELECT query
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    await this.ensureInitialized();
    
    if (this.config.enableQueryLogging) {
      console.log(`🔍 Query: ${sql}`, params.length > 0 ? params : '');
    }

    try {
      const rows = await this.db!.all(sql, params);
      return rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE statement
   */
  async execute(sql: string, params: any[] = []): Promise<void> {
    await this.ensureInitialized();
    
    if (this.config.enableQueryLogging) {
      console.log(`📝 Execute: ${sql}`, params.length > 0 ? params : '');
    }

    try {
      await this.db!.run(sql, params);
    } catch (error) {
      console.error('Database execute error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Execute multiple operations in a transaction
   */
  async transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T> {
    await this.ensureInitialized();
    
    const transaction: DatabaseTransaction = {
      query: async <U>(sql: string, params: any[] = []): Promise<U[]> => {
        return this.query<U>(sql, params);
      },
      execute: async (sql: string, params: any[] = []): Promise<void> => {
        await this.execute(sql, params);
      }
    };

    try {
      await this.db!.exec('BEGIN TRANSACTION');
      const result = await callback(transaction);
      await this.db!.exec('COMMIT');
      return result;
    } catch (error) {
      await this.db!.exec('ROLLBACK');
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<any> {
    await this.ensureInitialized();
    
    const tables = await this.query(`
      SELECT name, sql FROM sqlite_master 
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    `);

    const stats = {
      totalTables: tables.length,
      tables: {},
      databaseSize: 0
    };

    // Get row counts for each table
    for (const table of tables) {
      try {
        const result = await this.query(`SELECT COUNT(*) as count FROM ${table.name}`);
        (stats.tables as any)[table.name] = result[0].count;
      } catch (error) {
        (stats.tables as any)[table.name] = 'error';
      }
    }

    return stats;
  }

  /**
   * Health check - verify database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    // Create migrations table if it doesn&apos;t exist
    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrations = await this.getMigrations();
    const executedMigrations = await this.db!.all(
      'SELECT name FROM migrations ORDER BY id'
    );
    
    const executedNames = new Set(executedMigrations.map(m => m.name));

    for (const migration of migrations) {
      if (!executedNames.has(migration.name)) {
        console.log(`🔄 Running migration: ${migration.name}`);
        
        try {
          await this.db!.exec(migration.sql);
          await this.db!.run(
            'INSERT INTO migrations (name) VALUES (?)',
            [migration.name]
          );
          
          console.log(`✅ Migration completed: ${migration.name}`);
        } catch (error) {
          console.error(`❌ Migration failed: ${migration.name}`, error);
          throw error;
        }
      }
    }
  }

  /**
   * Get list of database migrations
   */
  private async getMigrations(): Promise<Array<{ name: string; sql: string }>> {
    return [
      {
        name: '001_create_users_table',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            profile TEXT NOT NULL DEFAULT '{}',
            preferences TEXT NOT NULL DEFAULT '{}',
            journey TEXT NOT NULL DEFAULT '{}',
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL
          );
          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
          CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
        `
      },
      {
        name: '002_create_memories_table',
        sql: `
          CREATE TABLE IF NOT EXISTS memories (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            embedding TEXT, -- JSON array of embedding vector
            metadata TEXT NOT NULL DEFAULT '{}',
            created_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
          CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
          CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);
          CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(JSON_EXTRACT(metadata, '$.type'));
        `
      },
      {
        name: '003_create_analytics_events_table',
        sql: `
          CREATE TABLE IF NOT EXISTS analytics_events (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            data TEXT NOT NULL DEFAULT '{}',
            timestamp DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
          CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
          CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(type);
          CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);
        `
      },
      {
        name: '004_create_daimonic_encounters_table',
        sql: `
          CREATE TABLE IF NOT EXISTS daimonic_encounters (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            archetype TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            guidance TEXT NOT NULL,
            trigger_context TEXT NOT NULL,
            integration_status TEXT NOT NULL DEFAULT 'pending',
            created_at DATETIME NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
          CREATE INDEX IF NOT EXISTS idx_daimonic_user_id ON daimonic_encounters(user_id);
          CREATE INDEX IF NOT EXISTS idx_daimonic_archetype ON daimonic_encounters(archetype);
          CREATE INDEX IF NOT EXISTS idx_daimonic_status ON daimonic_encounters(integration_status);
        `
      },
      {
        name: '005_create_configurations_table',
        sql: `
          CREATE TABLE IF NOT EXISTS configurations (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `
      },
      {
        name: '006_create_user_api_keys_table',
        sql: `
          CREATE TABLE IF NOT EXISTS user_api_keys (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            api_key TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL,
            last_used_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
          CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON user_api_keys(user_id);
          CREATE INDEX IF NOT EXISTS idx_api_keys_active ON user_api_keys(active);
        `
      }
    ];
  }

  /**
   * Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Dispose of database connection
   */
  async dispose(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
      console.log('Database connection closed');
    }
  }
}