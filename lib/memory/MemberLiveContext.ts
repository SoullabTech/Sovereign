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

// ============================================================================
// Builder — the single canonical assembly point
// ============================================================================

import { loadSpiralState } from '@/lib/consciousness/spiralStatePersistence';
import { getRecentSummaries } from '@/lib/scribe/sovereignSummarizer';
import { getActivePatternContext } from '@/lib/patterns/PatternOfferingService';
import { loadJournals } from '@/lib/memory/SignificantMomentsService';
import { loadRelationshipEssence } from '@/lib/consciousness/RelationshipAnamnesisPostgres';

export interface BuildMemberLiveContextOptions {
  /** Max session summaries to fetch (default 3) */
  maxSessions?: number;
  /** Max patterns to fetch (default 4) */
  maxPatterns?: number;
  /** Max journal entries to fetch (default 5) */
  maxJournal?: number;
  /** If true, skip all DB reads (sanctuary / anonymous sessions) */
  skip?: boolean;
  /** Display name for identity block */
  displayName?: string;
}

/**
 * Canonical assembly of everything MAIA knows about a member.
 *
 * Called once per conversation turn, before the oracle call.
 * All fetches are parallel; any individual failure degrades gracefully.
 * The returned object is typed and logged — never silently empty.
 *
 * Usage:
 *   const live = await buildMemberLiveContext(effectiveUserId, { displayName: userName });
 *   // then format into prompt or inspect via describeLiveContext(live)
 */
export async function buildMemberLiveContext(
  userId: string,
  options: BuildMemberLiveContextOptions = {}
): Promise<MemberLiveContext> {
  const {
    maxSessions = 3,
    maxPatterns = 4,
    maxJournal = 5,
    skip = false,
    displayName,
  } = options;

  const assembledAt = new Date().toISOString();

  // Empty context for sanctuary / anonymous sessions
  if (skip || !userId) {
    return {
      identity: { userId, displayName },
      spiralState: null,
      recentSessions: [],
      activePatterns: [],
      recentJournal: [],
      relationshipEssence: null,
      astrology: null,
      assembledAt,
    };
  }

  // Parallel fetch — all failures degrade gracefully, never throw
  const [
    spiralState,
    recentSessions,
    activePatterns,
    recentJournal,
    relationshipEssence,
  ] = await Promise.all([
    loadSpiralState(userId).catch(() => null),
    getRecentSummaries(userId, maxSessions).catch(() => []),
    getActivePatternContext(userId, maxPatterns).catch(() => [] as ActivePattern[]),
    loadJournals(userId, maxJournal).catch(() => [] as JournalEntry[]),
    loadRelationshipEssence(userId).catch(() => null),
  ]);

  return {
    identity: { userId, displayName },
    spiralState,
    recentSessions,
    activePatterns,
    recentJournal,
    relationshipEssence,
    astrology: null, // populated by route when birth data / transit engine available
    assembledAt,
  };
}

/**
 * Format a MemberLiveContext into a compact "Member Web" prompt block.
 *
 * Caps: 4 patterns, 3 sessions, 5 journals. Hard limits prevent prompt bloat.
 * Format is stable across turns — MAIA knows where to look in the prompt.
 */
export function formatMemberWebForPrompt(ctx: MemberLiveContext): string {
  if (
    ctx.activePatterns.length === 0 &&
    ctx.recentSessions.length === 0 &&
    ctx.recentJournal.length === 0
  ) {
    return ''; // Nothing to inject — don't add noise
  }

  const patternsBlock = ctx.activePatterns.length > 0
    ? ctx.activePatterns.slice(0, 4).map((p, i) => {
        const conf = (p.confidence * 100).toFixed(0);
        const when = p.lastEvidenceAt ? p.lastEvidenceAt.slice(0, 10) : 'unknown';
        return `  P${i + 1} [${conf}% | ${p.scope} | ${when}]: ${p.statement}`;
      }).join('\n')
    : '  None recorded yet.';

  const summariesBlock = ctx.recentSessions.length > 0
    ? ctx.recentSessions.slice(0, 3).map(s => {
        const date = s.completedAt.slice(0, 10);
        const rem = s.summary;
        const essence = rem.essence ? rem.essence.slice(0, 140) : 'Session completed';
        const topThemes = rem.themes?.slice(0, 3).join(', ') || '';
        const next = rem.nextStep ? ` → ${rem.nextStep.slice(0, 60)}` : '';
        return `  [${date}]${topThemes ? ` (${topThemes})` : ''}: ${essence}${next}`;
      }).join('\n')
    : '  No summaries yet — session history builds over time.';

  const journalsBlock = ctx.recentJournal.length > 0
    ? ctx.recentJournal.slice(0, 5).map(j => {
        const date = j.createdAt instanceof Date
          ? j.createdAt.toISOString().slice(0, 10)
          : String(j.createdAt).slice(0, 10);
        const preview = j.content.replace(/\s+/g, ' ').trim().slice(0, 200);
        const themes = j.themes?.slice(0, 3).join(', ') || '';
        return `  [${date}]${themes ? ` (${themes})` : ''} — ${preview}`;
      }).join('\n')
    : '  No journal entries yet.';

  return `🕸️ MEMBER WEB (Silent context — use as background awareness, do not recite):
Active Patterns (recurring structures in their life):
${patternsBlock}

Recent Session Arcs (what we've been working on):
${summariesBlock}

Recent Journal:
${journalsBlock}

Instruction: Before responding, silently check these threads. If relevant, reflect them briefly and propose one integration step. Do not quote this block directly.`;
}
