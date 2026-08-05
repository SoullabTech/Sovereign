/**
 * Memory Transition Record — the first Corpus Callosum accountability artifact.
 * (Sprint 1 · Truth Layer)
 *
 * Authority:
 *   docs/governance/MEMORY_SELECTION_PHILOSOPHY_RULING_INSTRUMENT_2026-08-04.md
 *     — Stage 2 observability: "I know the relationship between what I could
 *     access and what I offered."
 *   docs/ops/MAIA_OPERATIONAL_MEMORY_STAGED_REBUILD_CHARTER_2026-08-04.md §IV
 *
 * Answers, per turn and per memory source: what was available, retrieved,
 * eligible, offered into prompt assembly — and WHY, as sentences describing
 * policy decisions. This is not a retrieval improvement; it is an
 * accountability layer. Nothing on the conversation path reads it.
 *
 * Hard rules (founder-authorized scope, 2026-08-04):
 *   1. Reasons describe decisions. They do not rank humans or memories.
 *      Never a numeric relevance/importance score ("Importance: 0.87" is the
 *      named anti-pattern).
 *   2. Unknown is a valid state. Counts this layer cannot honestly measure are
 *      recorded as null, never guessed. injected_count stays null until
 *      injection observability exists (injection is tier-dependent: FAST/CORE
 *      inject, DEEP-primary does not).
 *   3. Observability must never block or alter the conversation: all IO here
 *      is fire-and-forget and failure-tolerant (warn + continue).
 *
 * Release unit: the writer ships with migration
 * 20260804000001_memory_transition_records.sql. Pre-migration the INSERT fails
 * non-fatally (warn per turn) — deploy via the FULL deploy path so migrations run.
 */

import { query } from '@/lib/db/postgres';
import { countMemberMemoryAtomStates } from './memoryAtomsLoader';
import {
  MEMORY_SELECTION_POLICY_VERSION,
  ATOM_SELECTION_POLICY_REASONS,
  CONVERSATIONAL_WINDOW_POLICY_REASONS,
} from './memorySelectionPolicy';

export type MemoryTransitionSource =
  | 'member_memory_atoms'
  | 'conversational'
  | 'episodic'
  | 'developmental';

export interface MemoryTransitionRecord {
  memberId: string;
  sessionId: string | null;
  sourceType: MemoryTransitionSource;
  /** Total rows stored for this member in this source. null = not measured. */
  availableCount: number | null;
  /** Rows the loader returned this turn. */
  retrievedCount: number | null;
  /** Rows passing consent/status filters before any cap. null = not measured. */
  eligibleCount: number | null;
  /** Rows formatted into a prompt addendum this turn. */
  offeredCount: number | null;
  /** Rows that reached the final prompt. null — tier-dependent, not yet observed. */
  injectedCount: number | null;
  selectionPolicyVersion: string;
  /** Sentences describing decisions — never scores. */
  selectionReasons: string[];
}

/** Per-source counts observed by the route this turn. */
export interface TransitionInputs {
  memberId: string;
  sessionId: string | null;
  atoms: { retrieved: number; offered: number };
  conversational: { retrieved: number; offered: number };
  episodic: { retrieved: number; offered: number };
  developmental: { retrieved: number; offered: number };
}

const INJECTION_UNKNOWN_REASON =
  'Injection is tier-dependent (FAST/CORE inject; DEEP-primary does not) and is not yet ' +
  'observed at this layer; unknown is recorded as null, not guessed.';

/**
 * Guard for hard rule 1: a reason must be a descriptive sentence, not a
 * numeric ranking. Used by tests and as a runtime tripwire (warn-only —
 * observability never throws).
 */
export function looksLikeScore(reason: string): boolean {
  return /(?:score|relevance|importance|weight|rank)\s*[:=]\s*-?\d/i.test(reason);
}

/**
 * Pure builder — separated from IO so the record shape and reasons are
 * unit-testable without a database.
 */
export function buildTransitionRecords(
  inputs: TransitionInputs,
  atomCounts: { stored: number; eligible: number } | null,
): MemoryTransitionRecord[] {
  const base = {
    memberId: inputs.memberId,
    sessionId: inputs.sessionId,
    selectionPolicyVersion: MEMORY_SELECTION_POLICY_VERSION,
    injectedCount: null,
  };

  const atomReasons = [...ATOM_SELECTION_POLICY_REASONS, INJECTION_UNKNOWN_REASON];
  if (inputs.atoms.retrieved > 0 && inputs.atoms.offered === 0) {
    atomReasons.push('Formatter produced no atoms block this turn; retrieved atoms were not offered.');
  }

  const conversationalReasons = [...CONVERSATIONAL_WINDOW_POLICY_REASONS, INJECTION_UNKNOWN_REASON];
  if (inputs.conversational.retrieved > 0 && inputs.conversational.offered === 0) {
    conversationalReasons.push(
      'Formatter suppressed the conversational block (member opt-out, Sanctuary, or session-resumption rule).',
    );
  }

  return [
    {
      ...base,
      sourceType: 'member_memory_atoms',
      availableCount: atomCounts?.stored ?? null,
      retrievedCount: inputs.atoms.retrieved,
      eligibleCount: atomCounts?.eligible ?? null,
      offeredCount: inputs.atoms.offered,
      selectionReasons: atomReasons,
    },
    {
      ...base,
      sourceType: 'conversational',
      availableCount: null,
      retrievedCount: inputs.conversational.retrieved,
      eligibleCount: null,
      offeredCount: inputs.conversational.offered,
      selectionReasons: conversationalReasons,
    },
    {
      ...base,
      sourceType: 'episodic',
      availableCount: null,
      retrievedCount: inputs.episodic.retrieved,
      eligibleCount: null,
      offeredCount: inputs.episodic.offered,
      selectionReasons: [
        'Member-marked moments only (never inferred significance); the 5 most recently marked.',
        INJECTION_UNKNOWN_REASON,
      ],
    },
    {
      ...base,
      sourceType: 'developmental',
      availableCount: null,
      retrievedCount: inputs.developmental.retrieved,
      eligibleCount: null,
      offeredCount: inputs.developmental.offered,
      selectionReasons: [
        'Recent developmental memories (3) and theme signals (10), ordered by significance ' +
          'and recency; the orchestrator decides prompt participation.',
        INJECTION_UNKNOWN_REASON,
      ],
    },
  ];
}

async function persistRecords(records: MemoryTransitionRecord[]): Promise<void> {
  if (records.length === 0) return;
  const values: string[] = [];
  const params: unknown[] = [];
  records.forEach((r) => {
    const o = params.length;
    values.push(
      `($${o + 1}, $${o + 2}, $${o + 3}, $${o + 4}, $${o + 5}, $${o + 6}, $${o + 7}, $${o + 8}, $${o + 9}, $${o + 10})`,
    );
    params.push(
      r.memberId,
      r.sessionId,
      r.sourceType,
      r.availableCount,
      r.retrievedCount,
      r.eligibleCount,
      r.offeredCount,
      r.injectedCount,
      r.selectionPolicyVersion,
      r.selectionReasons,
    );
  });
  await query(
    `INSERT INTO memory_transition_records
       (member_id, session_id, source_type, available_count, retrieved_count,
        eligible_count, offered_count, injected_count, selection_policy_version,
        selection_reasons)
     VALUES ${values.join(', ')}`,
    params,
  );
}

/**
 * Fire-and-forget entry point for the route handler. Measures atom
 * available/eligible counts, builds all per-source records, emits the
 * discoverable log marker, and persists. Never throws; never blocks.
 */
export function recordMemoryTransitions(inputs: TransitionInputs): void {
  void (async () => {
    try {
      const atomCounts = await countMemberMemoryAtomStates(inputs.memberId);
      const records = buildTransitionRecords(inputs, atomCounts);

      for (const r of records) {
        const scored = r.selectionReasons.find(looksLikeScore);
        if (scored) {
          // Hard rule 1 tripwire — should be unreachable; reasons are static policy text.
          console.warn('[MAIA] memory-transition reason looks like a score (rule 1):', scored);
        }
      }

      console.log('[MAIA] memory-transition', {
        memberIdPrefix: inputs.memberId.slice(0, 8) + '...',
        policy: MEMORY_SELECTION_POLICY_VERSION,
        atoms: {
          available: atomCounts?.stored ?? null,
          eligible: atomCounts?.eligible ?? null,
          retrieved: inputs.atoms.retrieved,
          offered: inputs.atoms.offered,
          injected: null,
        },
        conv: { retrieved: inputs.conversational.retrieved, offered: inputs.conversational.offered },
        ep: { retrieved: inputs.episodic.retrieved, offered: inputs.episodic.offered },
        dev: { retrieved: inputs.developmental.retrieved, offered: inputs.developmental.offered },
      });

      await persistRecords(records);
    } catch (err) {
      // Non-fatal by design (hard rule 3). Expected pre-migration: relation
      // memory_transition_records does not exist — run migrations (full deploy path).
      console.warn(
        '[MAIA] memory-transition persist failed (non-fatal):',
        err instanceof Error ? err.message : String(err),
      );
    }
  })();
}
