/**
 * Reflection Capsules - Types & Zod Schemas
 *
 * Philosophy: MAIA does not store experience as the primary object.
 * MAIA witnesses experience and remembers what mattered.
 * Capsules are distilled artifacts that capture the spirit of a conversation.
 */

import { z } from 'zod';

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export const SOURCE_TYPES = ['chat', 'voice', 'transcript', 'note', 'journal'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const ELEMENTS = ['fire', 'water', 'earth', 'air', 'aether'] as const;
export type Element = (typeof ELEMENTS)[number];

// =============================================================================
// ZOD SCHEMAS - NESTED STRUCTURES
// =============================================================================

/**
 * A gold line is a verbatim quote that landed - a moment of clarity or breakthrough
 */
export const GoldLineSchema = z.object({
  text: z.string().min(1),
  speaker: z.enum(['user', 'maia']).optional(),
});
export type GoldLine = z.infer<typeof GoldLineSchema>;

/**
 * A decision made during the conversation
 */
export const DecisionSchema = z.object({
  text: z.string().min(1),
});
export type Decision = z.infer<typeof DecisionSchema>;

/**
 * A next step with optional due date
 */
export const NextStepSchema = z.object({
  text: z.string().min(1),
  due: z.string().optional(), // ISO date string or natural language
});
export type NextStep = z.infer<typeof NextStepSchema>;

/**
 * A practice to embody - with steps to follow
 */
export const PracticeSchema = z.object({
  name: z.string().min(1),
  steps: z.array(z.string()).default([]),
});
export type Practice = z.infer<typeof PracticeSchema>;

/**
 * A pattern noticed - named softly, no pathology
 */
export const PatternSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});
export type Pattern = z.infer<typeof PatternSchema>;

/**
 * Elemental/consciousness signals from the conversation
 */
export const SignalsSchema = z.object({
  element: z.enum(ELEMENTS).optional(),
  facet: z.string().optional(),
  tone: z.string().optional(),
  archetype: z.string().optional(),
  intensity: z.union([z.string(), z.number()]).optional(),
}).nullable();
export type Signals = z.infer<typeof SignalsSchema>;

// =============================================================================
// ZOD SCHEMAS - API INPUT
// =============================================================================

/**
 * Create a capsule from raw text (journal entry, note, etc.)
 */
export const CapsuleCreateFromTextSchema = z.object({
  sourceType: z.enum(SOURCE_TYPES),
  text: z.string().min(1, 'Text is required'),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  signals: SignalsSchema.optional(),
  draft: z.boolean().optional().default(true),
});
export type CapsuleCreateFromTextInput = z.infer<typeof CapsuleCreateFromTextSchema>;

/**
 * Chat message structure (matches existing ChatMessageData pattern)
 */
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string().optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * Create a capsule from a chat window (last N turns)
 */
export const CapsuleCreateFromChatWindowSchema = z.object({
  messages: z.array(ChatMessageSchema).min(2, 'At least two messages are required'),
  windowSize: z.number().int().positive().max(32, 'Maximum window size is 32 turns').optional().default(16),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  signals: SignalsSchema.optional(),
  sourceId: z.string().optional(), // session_id reference
});
export type CapsuleCreateFromChatWindowInput = z.infer<typeof CapsuleCreateFromChatWindowSchema>;

/**
 * CONFIRM KEEP — the member-confirmed create.
 *
 * This is the only shape that authorizes an `INSERT INTO reflection_capsules`
 * from the Keep flow. It carries the draft the member actually saw and edited,
 * not a window to be re-distilled: what gets written is what they confirmed,
 * never a fresh interpretation of the conversation made after the fact.
 *
 * Contract: OPEN = zero persistence · PREPARE = ephemeral · CONFIRM = this.
 */
export const CapsuleCreateSchema = z.object({
  sourceType: z.enum(SOURCE_TYPES).default('chat'),
  sourceId: z.string().nullable().optional(),
  title: z.string().min(1),
  summary: z.string(),
  goldLines: z.array(z.any()).optional(),
  decisions: z.array(z.any()).optional(),
  nextSteps: z.array(z.any()).optional(),
  practices: z.array(z.any()).optional(),
  patterns: z.array(z.any()).optional(),
  signals: SignalsSchema.nullable().optional(),
  tags: z.array(z.string()).optional(),
  sourceExcerpt: z.string().nullable().optional(),
  draft: z.boolean().optional().default(true),
});
export type CapsuleCreateInput = z.infer<typeof CapsuleCreateSchema>;

/**
 * Update an existing capsule
 */
export const CapsuleUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  goldLines: z.array(z.union([GoldLineSchema, z.string()])).optional(),
  decisions: z.array(z.union([DecisionSchema, z.string()])).optional(),
  nextSteps: z.array(z.union([NextStepSchema, z.string()])).optional(),
  practices: z.array(PracticeSchema).optional(),
  patterns: z.array(z.union([PatternSchema, z.string()])).optional(),
  signals: SignalsSchema.optional(),
  tags: z.array(z.string()).optional(),
  sourceExcerpt: z.string().nullable().optional(),
  draft: z.boolean().optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
});
export type CapsuleUpdateInput = z.infer<typeof CapsuleUpdateSchema>;

/**
 * Query parameters for listing capsules
 */
export const CapsuleListQuerySchema = z.object({
  q: z.string().optional(),        // Search query
  archived: z.boolean().optional(), // Filter by archived
  pinned: z.boolean().optional(),   // Filter by pinned
  draft: z.boolean().optional(),    // Filter by draft status
  tag: z.string().optional(),       // Filter by tag
  limit: z.number().int().positive().max(100).optional().default(20),
  cursor: z.string().optional(),    // Cursor for pagination (created_at timestamp)
});
export type CapsuleListQuery = z.infer<typeof CapsuleListQuerySchema>;

// =============================================================================
// TYPESCRIPT TYPES - DATABASE ROW
// =============================================================================

/**
 * Database row type (matches reflection_capsules table)
 */
export interface CapsuleRow {
  id: string;
  user_id: string;
  source_type: SourceType;
  source_id: string | null;
  title: string;
  summary: string;
  gold_lines: (GoldLine | string)[];
  decisions: (Decision | string)[];
  next_steps: (NextStep | string)[];
  practices: Practice[];
  patterns: (Pattern | string)[];
  signals: Signals | null;
  tags: string[];
  source_excerpt: string | null;
  draft: boolean;
  pinned: boolean;
  archived: boolean;
  created_at: Date;
  updated_at: Date;
}

// =============================================================================
// TYPESCRIPT TYPES - API OUTPUT (DTO)
// =============================================================================

/**
 * API response type (camelCase, normalized)
 */
export interface CapsuleDTO {
  id: string;
  userId: string;
  sourceType: SourceType;
  sourceId: string | null;
  title: string;
  summary: string;
  goldLines: GoldLine[];
  decisions: Decision[];
  nextSteps: NextStep[];
  practices: Practice[];
  patterns: Pattern[];
  signals: Signals | null;
  tags: string[];
  sourceExcerpt: string | null;
  draft: boolean;
  pinned: boolean;
  archived: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

/**
 * Distillation draft - output from LLM distillation before saving
 */
export interface CapsuleDraft {
  title: string;
  summary: string;
  goldLines: (GoldLine | string)[];
  decisions: (Decision | string)[];
  nextSteps: (NextStep | string)[];
  practices: Practice[];
  patterns: (Pattern | string)[];
  signals?: Signals;
  tags?: string[];
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Normalize arrays that might be strings or objects
 */
export function normalizeGoldLines(arr: (GoldLine | string)[]): GoldLine[] {
  return arr.map((item) =>
    typeof item === 'string' ? { text: item } : item
  );
}

export function normalizeDecisions(arr: (Decision | string)[]): Decision[] {
  return arr.map((item) =>
    typeof item === 'string' ? { text: item } : item
  );
}

export function normalizeNextSteps(arr: (NextStep | string)[]): NextStep[] {
  return arr.map((item) =>
    typeof item === 'string' ? { text: item } : item
  );
}

export function normalizePatterns(arr: (Pattern | string)[]): Pattern[] {
  return arr.map((item) =>
    typeof item === 'string' ? { name: item } : item
  );
}

/**
 * Convert database row to API DTO
 */
export function rowToDTO(row: CapsuleRow): CapsuleDTO {
  return {
    id: row.id,
    userId: row.user_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    title: row.title,
    summary: row.summary,
    goldLines: normalizeGoldLines(row.gold_lines || []),
    decisions: normalizeDecisions(row.decisions || []),
    nextSteps: normalizeNextSteps(row.next_steps || []),
    practices: row.practices || [],
    patterns: normalizePatterns(row.patterns || []),
    signals: row.signals,
    tags: row.tags || [],
    sourceExcerpt: row.source_excerpt,
    draft: row.draft,
    pinned: row.pinned,
    archived: row.archived,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

// =============================================================================
// CAPTURE TRIGGER DETECTION (for suggestion chip)
// =============================================================================

/**
 * Heuristic triggers for suggesting capture
 * Returns true if the message suggests a moment worth capturing
 */
export function detectCaptureTrigger(message: string): boolean {
  const lowered = message.toLowerCase();

  // Explicit capture requests
  if (/\b(save|capture|distill|summarize|remember)\b/i.test(message)) {
    return true;
  }

  // Breakthrough language
  if (
    /\b(that landed|clicked|i see|wow|aha|oh)\b/i.test(message) ||
    /\b(makes sense|finally understand|it hit me)\b/i.test(message)
  ) {
    return true;
  }

  // Decision language
  if (
    /\b(i decided|i'm going to|i will|i've decided)\b/i.test(message) ||
    /\b(next step|my plan|going to try)\b/i.test(message)
  ) {
    return true;
  }

  // Commitment language
  if (
    /\b(i'll try|i will do|i'm committing|i promise)\b/i.test(message)
  ) {
    return true;
  }

  // Insight language
  if (
    /\b(i realize|i notice|i'm seeing|pattern)\b/i.test(message)
  ) {
    return true;
  }

  return false;
}
