/**
 * Database Runtime Types
 *
 * Generated from PostgreSQL schema via Prisma.
 * This replaces the old Supabase-style types with Prisma-generated types.
 *
 * Usage:
 *   import { PrismaClient, User, MAIAMemory } from '@/lib/types/database';
 *   import { prisma } from '@/lib/types/database';
 *
 * Schema source: prisma/schema.prisma
 * Generated: prisma generate (runs on npm install via postinstall hook)
 */

import { PrismaClient } from '@prisma/client';

// Re-export Prisma Client for database operations
export { PrismaClient };

// Re-export all Prisma-generated types
export type {
  // Users & Auth
  User,
  Session,

  // MAIA Core
  MAIAMemory,
  SymbolicThread,
  EmotionalMotif,
  UserIntention,
  ArchetypeHistory,
  ElementalState,
  ElementalEvolution,
  InternalReflection,
  QuoteShared,
  SymbolResonance,

  // Dreams & Unconscious
  DreamMemory,
  DreamPattern,
  ArchetypalPattern,
  DreamJourneyThread,
  WisdomCaptureState,
  WisdomMoment,
  SleepSession,
  CircadianProfile,
  CircadianEvent,

  // Astrology
  BirthChart,

  // Analytics & Insights
  ConversationAnalytics,
  ConversationTranscript,
  ConversationSession,
  ConversationTurn,
  ConversationInsight,
  SubconsciousPattern,
  WisdomEmergenceEvent,
  PatternCorrelation,
  ArchetypalActivationLog,
  CorrelationAnalysis,
  ConsciousnessComputingFeedback,
  ConsciousnessComputingAnalytics,
  ConsciousnessSessionQuality,
  ConsciousnessJourneyMap,
  EnhancedConversationAnalysis,

  // Beta & Premium
  BetaTester,
  PremiumMemberStorage,
  ExportArchive,
  BackupSnapshot,

  // Prisma namespace with all helper types
  Prisma,
} from '@prisma/client';

/**
 * Database client singleton
 * Import this instead of creating new PrismaClient instances
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Database type alias (for legacy compatibility)
 */
export type Database = typeof prisma;

/**
 * Generic database client type (for dependency injection)
 */
export type DBClient = PrismaClient;

/**
 * Realtime channel type placeholder
 * TODO: Implement with PostgreSQL LISTEN/NOTIFY or WebSocket
 */
export type RealtimeChannel = {
  on: (event: string, callback: (payload: any) => void) => void;
  off: (event: string) => void;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
};

/**
 * Legacy JSON type for compatibility
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
