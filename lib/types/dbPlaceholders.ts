/**
 * Database Type Placeholders - DEPRECATED
 *
 * This file is deprecated. Use @/lib/types/database instead.
 * Kept for backwards compatibility during migration.
 *
 * @deprecated Import from '@/lib/types/database' instead
 */

// Re-export everything from the new database types
export type {
  Database,
  DBClient,
  RealtimeChannel,
  User,
  Session,
  Json,
} from './database';

// Add any missing legacy types here for compatibility
