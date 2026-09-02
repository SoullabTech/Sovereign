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

export interface FieldState {
  /** Most common emotional tone across recent journals (e.g. 'grief', 'curiosity', 'confusion') */
  dominantTone?: string;
  /** Highest-count recurring participatory theme */
  dominantTheme?: string;
  /** Top active pattern statement from the interpretive ledger */
  activePattern?: string;
  /** How recent the signal evidence is */
  recency: 'high' | 'medium' | 'low';
  /** 0–1 composite confidence based on signal breadth */
  confidence: number;
  /** Named psychological tension if detectable (e.g. 'grief vs forward momentum') */
  tension?: string;
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

  // Participatory themes recurring across recent sessions (closed feedback loop)
  recurringThemes?: ThemeRecurrence[];

  // Interpreted field state — synthesized from all signal layers
  fieldState?: FieldState;

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
    recurringThemes: ctx.recurringThemes?.length ?? 0,
    hasEssence: ctx.relationshipEssence != null,
    hasNatal: ctx.astrology?.hasBirthData ?? false,
    hasCosmicWeather: (ctx.astrology?.formattedContext?.length ?? 0) > 0,
  };
}

// ============================================================================
// Field State Derivation — signal synthesis helpers
// ============================================================================

function toTime(value?: string | Date | null): number | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();
  return Number.isFinite(time) ? time : null;
}

function getMostRecentTimestamp(ctx: {
  recentJournal?: JournalEntry[];
  recentSessions?: Array<{ completedAt: string }>;
}): number | null {
  const candidates: Array<number | null> = [
    ...(ctx.recentJournal ?? []).map(j => toTime(j.createdAt)),
    ...(ctx.recentSessions ?? []).map(s => toTime(s.completedAt)),
  ];
  const valid = candidates.filter((v): v is number => v !== null);
  if (!valid.length) return null;
  return Math.max(...valid);
}

function deriveRecency(
  recentJournal?: JournalEntry[],
  recentSessions?: Array<{ completedAt: string }>
): 'high' | 'medium' | 'low' {
  const latest = getMostRecentTimestamp({ recentJournal, recentSessions });
  if (!latest) return 'low';
  const ageDays = (Date.now() - latest) / (1000 * 60 * 60 * 24);
  if (ageDays <= 3) return 'high';
  if (ageDays <= 10) return 'medium';
  return 'low';
}

function deriveDominantTone(recentJournal?: JournalEntry[]): string | undefined {
  // Journals don't carry a pre-computed tone field yet — infer from themes/tags
  const tones = (recentJournal ?? [])
    .flatMap(j => j.themes ?? [])
    .filter(t =>
      ['grief', 'joy', 'anger', 'fear', 'confusion', 'peace', 'resistance',
       'anxiety', 'heaviness', 'curiosity', 'sadness', 'hope'].includes(t)
    );
  if (!tones.length) return undefined;
  const counts = new Map<string, number>();
  for (const t of tones) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

function deriveDominantTheme(recurringThemes?: ThemeRecurrence[]): string | undefined {
  if (!recurringThemes?.length) return undefined;
  return recurringThemes[0].theme.replace(/_/g, ' ');
}

function deriveActivePattern(activePatterns?: ActivePattern[]): string | undefined {
  if (!activePatterns?.length) return undefined;
  return activePatterns[0].statement;
}

function deriveConfidence(input: {
  dominantTone?: string;
  dominantTheme?: string;
  activePattern?: string;
  recency: 'high' | 'medium' | 'low';
  recentJournal?: JournalEntry[];
  recurringThemes?: ThemeRecurrence[];
  activePatterns?: ActivePattern[];
  recentSessions?: Array<{ sessionId: string; summary: any; completedAt: string }>;
}): number {
  let score = 0;
  if (input.dominantTone) score += 0.2;
  if (input.dominantTheme) score += 0.2;
  if (input.activePattern) score += 0.2;
  if ((input.recentSessions?.length ?? 0) > 0) score += 0.1;
  if ((input.recentJournal?.length ?? 0) >= 2) score += 0.1;
  if ((input.recurringThemes?.length ?? 0) >= 1) score += 0.05;
  if ((input.activePatterns?.length ?? 0) >= 1) score += 0.05;
  if (input.recency === 'high') score += 0.1;
  if (input.recency === 'medium') score += 0.05;
  return Math.min(1, Number(score.toFixed(2)));
}

function deriveTension(input: {
  dominantTone?: string;
  dominantTheme?: string;
  activePattern?: string;
}): string | undefined {
  const text = [
    input.dominantTone ?? '',
    input.dominantTheme ?? '',
    input.activePattern ?? '',
  ].join(' | ').toLowerCase();

  if ((text.includes('grief') || text.includes('loss')) &&
      (text.includes('forward') || text.includes('momentum') ||
       text.includes('ambition') || text.includes('progress') || text.includes('perform'))) {
    return 'grief vs forward momentum';
  }
  if ((text.includes('connection') || text.includes('relationship') || text.includes('longing')) &&
      (text.includes('withdraw') || text.includes('distance') || text.includes('protect') ||
       text.includes('isolat'))) {
    return 'longing for connection vs protective withdrawal';
  }
  if ((text.includes('clarity') || text.includes('vision') || text.includes('ready')) &&
      (text.includes('fear') || text.includes('avoidance') || text.includes('confusion') ||
       text.includes('stuck'))) {
    return 'clarity vs avoidance';
  }
  if ((text.includes('expand') || text.includes('ambition')) &&
      (text.includes('exhaust') || text.includes('deplet') || text.includes('burnout'))) {
    return 'expansion vs exhaustion';
  }
  return undefined;
}

function deriveFieldState(input: {
  recentJournal?: JournalEntry[];
  recurringThemes?: ThemeRecurrence[];
  activePatterns?: ActivePattern[];
  recentSessions?: Array<{ sessionId: string; summary: any; completedAt: string }>;
}): FieldState {
  const dominantTone = deriveDominantTone(input.recentJournal);
  const dominantTheme = deriveDominantTheme(input.recurringThemes);
  const activePattern = deriveActivePattern(input.activePatterns);
  const recency = deriveRecency(input.recentJournal, input.recentSessions);
  const confidence = deriveConfidence({
    dominantTone,
    dominantTheme,
    activePattern,
    recency,
    recentJournal: input.recentJournal,
    recurringThemes: input.recurringThemes,
    activePatterns: input.activePatterns,
    recentSessions: input.recentSessions,
  });
  const tension = deriveTension({ dominantTone, dominantTheme, activePattern });

  return { dominantTone, dominantTheme, activePattern, recency, confidence, tension };
}

// ============================================================================
// Builder — the single canonical assembly point
// ============================================================================

import { loadSpiralState } from '@/lib/consciousness/spiralStatePersistence';
import { getRecentSummaries } from '@/lib/scribe/sovereignSummarizer';
import { getActivePatternContext } from '@/lib/patterns/PatternOfferingService';
import { loadJournals } from '@/lib/memory/SignificantMomentsService';
import {
  adjudicateParticipation,
  adjudicateDerivation,
  type ProvenanceClaim,
} from '@/lib/maia/participationGate';
import { loadRelationshipEssence } from '@/lib/consciousness/RelationshipAnamnesisPostgres';
import { getRecentThemes, findRecurringThemes } from '@/lib/consciousness/participatoryRealityHelper';
import type { ThemeRecurrence } from '@/lib/consciousness/participatoryReality';

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
      recurringThemes: [],
      fieldState: undefined,
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
    rawThemeSignals,
  ] = await Promise.all([
    loadSpiralState(userId).catch(() => null),
    getRecentSummaries(userId, maxSessions).catch(() => []),
    getActivePatternContext(userId, maxPatterns).catch(() => [] as ActivePattern[]),
    loadJournals(userId, maxJournal).catch(() => [] as JournalEntry[]),
    loadRelationshipEssence(userId).catch(() => null),
    getRecentThemes(userId, 20, 30).catch(() => []),
  ]);

  const recurringThemes = findRecurringThemes(rawThemeSignals);

  const fieldState = deriveFieldState({
    recentJournal,
    recurringThemes,
    activePatterns,
    recentSessions,
  });

  console.log('[field-state]', {
    dominantTone: fieldState.dominantTone,
    dominantTheme: fieldState.dominantTheme,
    activePattern: fieldState.activePattern,
    recency: fieldState.recency,
    confidence: fieldState.confidence,
    tension: fieldState.tension,
  });

  return {
    identity: { userId, displayName },
    spiralState,
    recentSessions,
    activePatterns,
    recentJournal,
    relationshipEssence,
    recurringThemes,
    fieldState,
    astrology: null, // populated by route when birth data / transit engine available
    assembledAt,
  };
}

/**
 * P3d (MIPA Phase 0) — THE COMPOSITION-ELIGIBLE VIEW OF THE MEMBER WEB.
 *
 * `formatMemberWebForPrompt` no longer takes a `MemberLiveContext`. It takes
 * THIS type, which structurally does not contain the excluded classes — so the
 * formatter cannot reach `activePatterns`, `recentSessions`, `recurringThemes`
 * or `fieldState` at all. Not filtered: absent.
 *
 * WHAT WAS EXCLUDED, AND WHY (partition, not deletion):
 *
 *   activePatterns   `pattern_ledger` — machine detects the pattern, machine
 *                    authors the statement, machine assigns the confidence, and
 *                    the formatter rendered `P1 [87% | scope | date]: …`. The
 *                    percentage does not increase authority; it makes the
 *                    inference SOUND authoritative. SYSTEM_INFERENCE.
 *
 *   recentSessions   Machine-generated session essences. Every sentence
 *                    summarized may have been the member's — the SUMMARY is
 *                    not. Transformation creates a newly authored object:
 *
 *                        member testimony --machine summarizes--> MAIA-AUTHORED
 *
 *                    Authorship attaches to the representation, not merely to
 *                    the raw material it was derived from.
 *
 *   recurringThemes  Derived from `member_theme_signals`, already excluded by
 *                    R24. A derivation over excluded material stays excluded.
 *                    (Its prompt text already carried an epistemic caveat from
 *                    the 2026-07-17 R4 ruling — Grade C instructional restraint.
 *                    P3d makes it structural.)
 *
 *   fieldState       `deriveFieldState({ recentJournal, recurringThemes,
 *                    activePatterns, recentSessions })` with a rendered
 *                    `confidence=0.72`. Three of its four inputs are excluded,
 *                    so the derivation rule excludes it. This is precisely the
 *                    laundering case: never composing `pattern.statement` while
 *                    composing "dominant_theme=… confidence=0.87".
 *
 * WHAT SURVIVES:
 *
 *   recentJournal    The member's own writing, from `quick_journal_entries` and
 *                    `elemental_journal_entries` — tables written only by
 *                    authenticated member gestures with member-supplied
 *                    content. Authorship is structurally certifiable from the
 *                    write path, exactly as `conversation_turns.role = 'user'`
 *                    is. MEMBER_AUTHORED, and it composes.
 *
 *                    Its `themes` annotation does NOT survive: nothing
 *                    establishes who authored those tags, and unknown
 *                    provenance is excluded rather than guessed — the
 *                    never-guess rule applied at field granularity.
 *
 * P3d is a partition. Solving it by deleting the formatter would have removed
 * the member's own journal alongside MAIA's inferences about them, which is a
 * constitutional failure in the opposite direction.
 */
export interface CertifiedMemberWeb {
  /** Member-authored journal content. Themes deliberately not carried. */
  journal: Array<{ createdAt: Date | string; content: string }>;
  /** Observability only — never composed. */
  excluded: {
    patterns: number;
    sessions: number;
    themes: number;
    fieldState: boolean;
  };
}

/**
 * Adjudicate a MemberLiveContext into its composition-eligible view.
 *
 * Every class is adjudicated through the SAME `adjudicateParticipation` /
 * `adjudicateDerivation` gate that P3a, P3b and P3c use. No parallel model.
 */
export function certifyMemberWeb(ctx: MemberLiveContext): CertifiedMemberWeb {
  // ── Machine-authored classes. `pattern_ledger` and the summary pipeline
  //    record no member authorship, so the claim is null — never guessed.
  const patternsVerdict = adjudicateParticipation({
    provenance: null as ProvenanceClaim,
    endorsement: 'none',
  });
  const sessionsVerdict = adjudicateParticipation({
    provenance: { authoredBy: 'maia', authorityClass: 'inference' },
    endorsement: 'none',
  });
  const themesVerdict = adjudicateParticipation({
    provenance: null as ProvenanceClaim,
    endorsement: 'none',
  });

  // ── The member's own writing. Authorship is structurally certifiable from
  //    the write path: these tables hold only member-supplied content written
  //    through authenticated member gestures.
  const journalVerdict = adjudicateParticipation({
    provenance: { authoredBy: 'member', authorityClass: 'testimony' },
    endorsement: 'none',
  });

  // ── The derivation. Its inputs are journal + themes + patterns + sessions;
  //    the least-certified governs, so it is excluded regardless of the journal.
  const fieldStateVerdict = adjudicateDerivation([
    journalVerdict,
    themesVerdict,
    patternsVerdict,
    sessionsVerdict,
  ]);

  return {
    journal: journalVerdict.admitted
      ? (ctx.recentJournal ?? []).slice(0, 5).map((j) => ({
          createdAt: j.createdAt,
          content: j.content,
        }))
      : [],
    excluded: {
      patterns: patternsVerdict.admitted ? 0 : (ctx.activePatterns?.length ?? 0),
      sessions: sessionsVerdict.admitted ? 0 : (ctx.recentSessions?.length ?? 0),
      themes: themesVerdict.admitted ? 0 : (ctx.recurringThemes?.length ?? 0),
      fieldState: !fieldStateVerdict.admitted && !!ctx.fieldState,
    },
  };
}

/**
 * Format the composition-eligible Member Web into a prompt block.
 *
 * P3d: takes `CertifiedMemberWeb`, not `MemberLiveContext`. The excluded
 * classes are not in scope — reaching them is a compile error, not an omission
 * a reviewer must notice.
 */
export function formatMemberWebForPrompt(web: CertifiedMemberWeb): string {
  if (web.journal.length === 0) {
    return ''; // Nothing certified to surface — silence, not an empty scaffold.
  }

  const journalsBlock = web.journal
    .map((j) => {
      const date =
        j.createdAt instanceof Date
          ? j.createdAt.toISOString().slice(0, 10)
          : String(j.createdAt).slice(0, 10);
      // Content only. No `themes` annotation — its authorship is unestablished.
      const preview = j.content.replace(/\s+/g, ' ').trim().slice(0, 200);
      return `  [${date}] — ${preview}`;
    })
    .join('\n');

  return `🕸️ MEMBER WEB (Silent context — use as background awareness, do not recite):
Recent Journal (the member's own writing):
${journalsBlock}

Instruction: Before responding, silently check these threads. If relevant, reflect them briefly and propose one integration step. Do not quote this block directly.`;
}
