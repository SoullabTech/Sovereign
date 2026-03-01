/**
 * MemberLiveContext — The Contract
 *
 * This is the canonical shape of everything MAIA knows about a member
 * before a conversation begins. It is not assembled here — it is defined here.
 *
 * Architecture intent:
 *   Each field maps to one real source of truth in the DB.
 *   Optional fields degrade gracefully — their absence never blocks the oracle.
 *   The shape is versioned: add fields by appending, never by reshaping.
 *
 * Current assembly: ad-hoc via Promise.allSettled() in oracle/conversation/route.ts
 * Future target: buildMemberLiveContext(userId) → MemberLiveContext
 *   (single cacheable, observable, testable context object)
 *
 * Sovereignty invariant:
 *   This object may NOT contain raw conversation content from sanctuary sessions.
 *   It MAY contain summaries, patterns, and structural state.
 *   Every field here was either authored by the member or surfaced by MAIA with
 *   the member's implicit consent through continuity mode.
 */

import type { SpiralState } from '@/lib/consciousness/spiralStatePersistence';
import type { SessionRemembrance } from '@/lib/scribe/sovereignSummarizer';
import type { RelationshipEssence } from '@/lib/consciousness/RelationshipAnamnesisPostgres';
import type { AstrologyContext } from '@/lib/services/maiaAstrologyContextService';

// ============================================================================
// Sub-types
// ============================================================================

export interface MemberIdentity {
  userId: string;
  displayName?: string;
}

export interface ActivePattern {
  id: string;
  /** The observed pattern stated plainly — MAIA's voice, not clinical language */
  statement: string;
  /** 0–1 confidence from evidence accumulation */
  confidence: number;
  /** 'emerging' | 'partial' | 'offered' | 'confirmed' — never 'retired' */
  status: string;
  /** Domain scope e.g. 'relational', 'somatic', 'creative' */
  scope: string;
  /** ISO timestamp of most recent evidence */
  lastEvidenceAt?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  /** Spiralogic element if tagged */
  element?: string;
  /** 'quick' | 'elemental' */
  entryType?: string;
  tags?: string[];
  createdAt: string;
}

export interface CaptureNote {
  id: string;
  content: string;
  tags?: string[];
  createdAt: string;
}

export interface CosmicWeather {
  moonPhase?: string;
  retrogrades?: string[];
  mayanSign?: string;
  formatted?: string;
}

// ============================================================================
// The Contract
// ============================================================================

/**
 * Everything MAIA knows about a member at session start.
 *
 * Presence rules:
 *   spiralState      — always attempted; fallback to default if missing
 *   recentSessions   — empty array if pipeline not yet running
 *   recentTurns      — fallback when no summaries
 *   activePatterns   — empty if none detected yet
 *   recentJournal    — empty if member hasn't written
 *   relationshipEssence — null until enough encounters accumulate
 *   captures         — empty until capture UI ships
 *   astrology        — cosmicWeather always; natal only if birth data exists
 */
export interface MemberLiveContext {
  identity: MemberIdentity;

  // Structural position in the Spiralogic map
  spiralState?: SpiralState | null;

  // Session memory — the arc across time
  recentSessions: Array<{
    sessionId: string;
    summary: SessionRemembrance;
    completedAt: string;
  }>;
  // Fallback when no summaries yet
  recentTurns?: Array<{
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
  }>;

  // MAIA-observed patterns (from pattern_ledger)
  activePatterns: ActivePattern[];

  // Member-authored writing (elemental + quick journals)
  recentJournal: JournalEntry[];

  // Soul-level recognition built across encounters
  relationshipEssence?: RelationshipEssence | null;

  // Life notes and commitments (captures — future)
  captures?: CaptureNote[];

  // Cosmic context
  astrology?: AstrologyContext | null;

  // When this context was assembled
  assembledAt: string;
}

// ============================================================================
// Context Quality Diagnostics
// ============================================================================

/**
 * Quick summary of what context is actually present.
 * Use for logging / observability, not for prompting.
 */
export function describeLiveContext(ctx: MemberLiveContext): Record<string, unknown> {
  return {
    sessions: ctx.recentSessions.length,
    turnsFallback: (ctx.recentTurns?.length ?? 0) > 0,
    patterns: ctx.activePatterns.length,
    journal: ctx.recentJournal.length,
    hasEssence: ctx.relationshipEssence != null,
    hasNatal: ctx.astrology?.hasBirthData ?? false,
    hasCosmicWeather: (ctx.astrology?.formattedContext?.length ?? 0) > 0,
  };
}
