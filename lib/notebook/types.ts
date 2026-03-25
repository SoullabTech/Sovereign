/**
 * Living Notebook — Type definitions
 *
 * Unified cognitive capture system. Entries auto-classify and mature over time.
 */

// ═══════════════════════════════════════════════════════════════
// Enums (match CHECK constraints in migration)
// ═══════════════════════════════════════════════════════════════

export type EntryType = 'note' | 'task' | 'insight' | 'pattern' | 'decision' | 'reminder';
export type EntryStatus = 'active' | 'done' | 'archived' | 'snoozed';
export type EntrySource = 'manual' | 'voice' | 'maia' | 'comms' | 'import';
export type EntryPriority = 'low' | 'medium' | 'high' | 'urgent';
export type PrimaryContext = 'personal' | 'client' | 'project' | 'system';

// ═══════════════════════════════════════════════════════════════
// Classification (stored as JSONB)
// ═══════════════════════════════════════════════════════════════

export interface EntryClassification {
  confidence: number;         // 0-1 — how confident the classifier is
  detected_type: EntryType;   // what the classifier thinks this is
  detected_tags: string[];    // auto-extracted tags
  model: string;              // 'heuristic-v1', 'claude-haiku-v1', etc.
}

// ═══════════════════════════════════════════════════════════════
// Evolution State (stored as JSONB)
// ═══════════════════════════════════════════════════════════════

export interface EvolutionState {
  /** Entry type history: note → insight → pattern */
  promoted_from?: EntryType;
  /** Bridge to existing state layers */
  themes?: string[];
  element?: string;
  facet?: string;
  /** IDs of related entries */
  linked_entries?: string[];
}

// ═══════════════════════════════════════════════════════════════
// Source Reference (stored as JSONB)
// ═══════════════════════════════════════════════════════════════

export interface SourceRef {
  type: string;   // 'conversation', 'session', 'comms_thread', 'voice_note'
  id: string;
  url?: string;
}

// ═══════════════════════════════════════════════════════════════
// Core Entry (maps to notebook_entries table)
// ═══════════════════════════════════════════════════════════════

export interface NotebookEntry {
  id: string;
  member_id: string;
  content: string;
  entry_type: EntryType;
  title: string | null;
  tags: string[];
  status: EntryStatus;
  priority: EntryPriority | null;
  due_at: string | null;
  source: EntrySource;
  source_ref: SourceRef | null;
  client_id: string | null;
  conversation_id: string | null;
  session_id: string | null;
  primary_context: PrimaryContext;
  classification: EntryClassification | null;
  weight: number;
  occurrence_count: number;
  last_seen_at: string | null;
  evolution_state: EvolutionState;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  completed_at: string | null;
}

// ═══════════════════════════════════════════════════════════════
// Input Types
// ═══════════════════════════════════════════════════════════════

export interface CreateEntryInput {
  content: string;
  entry_type?: EntryType;       // auto-classified if omitted
  title?: string;
  tags?: string[];
  priority?: EntryPriority;
  due_at?: string;
  source?: EntrySource;
  source_ref?: SourceRef;
  client_id?: string;
  conversation_id?: string;
  session_id?: string;
  primary_context?: PrimaryContext;
}

export interface UpdateEntryInput {
  content?: string;
  entry_type?: EntryType;
  title?: string;
  tags?: string[];
  status?: EntryStatus;
  priority?: EntryPriority | null;
  due_at?: string | null;
  client_id?: string | null;
  conversation_id?: string | null;
  session_id?: string | null;
  primary_context?: PrimaryContext;
  weight?: number;
  occurrence_count?: number;
  last_seen_at?: string;
  evolution_state?: EvolutionState;
}

// ═══════════════════════════════════════════════════════════════
// Filter (for list queries)
// ═══════════════════════════════════════════════════════════════

export interface NotebookFilter {
  entry_type?: EntryType;
  status?: EntryStatus;
  primary_context?: PrimaryContext;
  client_id?: string;
  tag?: string;
  search?: string;            // full-text search query
  limit?: number;             // default 20
  offset?: number;            // default 0
}
