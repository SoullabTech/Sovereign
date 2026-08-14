/**
 * relationshipSignalService — Insert and query `member_relational_signals`.
 *
 * Server-only. Callers:
 *   - sovereign MAIA route (fire-and-forget auto-detection)
 *   - /api/maia/relational-signal route (GET for the card, POST from labtools)
 *
 * All writes are additive. The card reads the latest row for a member.
 */

import { query, insertOne, queryOne } from '@/lib/db/postgres';
import type {
  CounterpartLabel,
  DetectedSignal,
  DynamicTag,
  MovementCue,
  RelationshipSignal,
  RelationshipTone,
  RuptureState,
  SignalSource,
} from './types';
import {
  CANONICAL_COUNTERPART_LABELS,
  CANONICAL_DYNAMIC_TAGS,
  CANONICAL_MOVEMENT_CUES,
  CANONICAL_TONES,
  RUPTURE_STATES,
} from './types';

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION — cheap guards so bad data never reaches the table
// ─────────────────────────────────────────────────────────────────────────────

function safeTone(v: unknown): RelationshipTone | null {
  return typeof v === 'string' && (CANONICAL_TONES as readonly string[]).includes(v)
    ? (v as RelationshipTone)
    : null;
}

function safeRupture(v: unknown): RuptureState | null {
  return typeof v === 'string' && (RUPTURE_STATES as readonly string[]).includes(v)
    ? (v as RuptureState)
    : null;
}

function safeCounterpart(v: unknown): CounterpartLabel | null {
  return typeof v === 'string' &&
    (CANONICAL_COUNTERPART_LABELS as readonly string[]).includes(v)
    ? (v as CounterpartLabel)
    : null;
}

function safeDynamicTags(v: unknown): DynamicTag[] {
  if (!Array.isArray(v)) return [];
  const valid = v.filter(
    (x): x is DynamicTag =>
      typeof x === 'string' && (CANONICAL_DYNAMIC_TAGS as readonly string[]).includes(x),
  );
  return Array.from(new Set(valid)).slice(0, 3);
}

function safeFrameworks(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const valid = v.filter(
    (x): x is string => typeof x === 'string' && x.length > 0 && x.length < 40,
  );
  return Array.from(new Set(valid)).slice(0, 6);
}

function safeSource(v: unknown): SignalSource | null {
  return v === 'maia_conversation' || v === 'labtool_manual' ? v : null;
}

// [Relational Layer — Phase 4]
function safeMovementCue(v: unknown): MovementCue | null {
  return typeof v === 'string' &&
    (CANONICAL_MOVEMENT_CUES as readonly string[]).includes(v)
    ? (v as MovementCue)
    : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// INSERT
// ─────────────────────────────────────────────────────────────────────────────

interface InsertInput {
  memberId: string;
  relationshipId?: string | null;
  counterpartLabel?: CounterpartLabel | null;
  tone?: RelationshipTone | null;
  ruptureState?: RuptureState | null;
  dynamicTags?: DynamicTag[];
  frameworksApplied?: string[];
  source: SignalSource;
  confidence?: number | null;
  /** Optional join key into maia_turns.id (bigint). */
  sourceTurnId?: number | null;
  /** Phase 4: member-selected "what feels most active". */
  movementCue?: MovementCue | null;
}

function safeTurnId(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) return null;
  // maia_turns.id is bigint but we never expect ids outside safe int range
  // during v1. Reject anything above Number.MAX_SAFE_INTEGER defensively.
  if (v > Number.MAX_SAFE_INTEGER) return null;
  return Math.trunc(v);
}

/**
 * RUPTURE CONTAINMENT — founder ruling 2026-08-13.
 *
 * > "Inferred rupture/strain detection may not persist a relationship-state
 * > assertion until the substrate can preserve relationship identity,
 * > originating evidence, authorship/provenance, and correctability."
 *
 * `rupture_state` is the strongest claim this table can make: that a human
 * relationship is broken. Today it is decided by an UNANCHORED SUBSTRING MATCH
 * on the member's message (`detectRelationalSignal.ts`: `userLower.includes(kw)`
 * over 14 strings including 'broken', 'divorce', 'break up' — not tokenized, not
 * negation-aware). "My laptop is broken" matches. "I don't want to break up with
 * him" matches.
 *
 * And the resulting row is epistemically unrecoverable. Production, 2026-08-13:
 * 0 of 440 rows carry `relationship_id`; 0 of 440 carry `source_turn_id`
 * (including 51 written AFTER that column existed); 440 of 440 are
 * `source='maia_conversation'`, because the CHECK constraint has no
 * member-declaration value at all. The assertion is stored while the
 * relationship it concerns, the sentence it came from, and any member authorship
 * are all absent. Every further write compounds evidence that cannot afterwards
 * be responsibly interpreted.
 *
 * The gate sits HERE — the single persistence chokepoint every writer passes
 * through — rather than in the detector, so a future inferred writer is contained
 * by default instead of having to remember. Detection still runs; the rest of the
 * signal still persists. Only the ASSERTION is withheld.
 *
 * ⛔ This is not a cleanup. The existing 44 `ruptured` + 53 `strained` rows are
 * untouched and preserved as forensic evidence — no deletion, no backfill, no
 * reinterpretation (founder ruling). See
 * docs/architecture/audits/relational-field-reconciliation/RUPTURE_CONTAINMENT_QUESTION_2026-08-13.md
 *
 * TO LIFT: restore the value only once a row can carry relationship identity, its
 * originating turn, explicit authorship, and a member correction path — i.e.
 * after RU-1 provenance.
 *
 * ⚠️ WHY THIS SET IS EMPTY — founder correction, 2026-08-13.
 *
 * A first draft of this gate exempted `labtool_manual`, reasoning "containment is
 * on inference, never on declaration." That was wrong, and wrong in exactly the
 * way this whole programme keeps finding: **a technical provenance label was
 * granted more human meaning than the evidence warrants.** "Manual" says a tool
 * path wrote the row — an operator, a form, a script. It does not establish that
 * a *member authored the assertion*. Provenance is not authorship.
 *
 * The schema cannot currently represent declaration at all: the CHECK constraint
 * permits only 'maia_conversation' and 'labtool_manual', and no row carries any
 * independent field proving member authorship of a rupture state. So under the
 * present substrate **no source qualifies**, and the honest set is empty.
 *
 * The invariant: only an explicitly representable and positively proven member
 * declaration may persist a rupture state. Anything else fails closed.
 *
 * ⛔ Do NOT add a value here to make a surface work. A source belongs in this set
 * only after the schema gains a genuine provenance vocabulary (member-declared /
 * MAIA-observed / inferred / imported) — which this containment unit deliberately
 * does NOT invent.
 */
const DECLARATION_CAPABLE_SOURCES: ReadonlySet<string> = new Set();

/** Persist one relational signal. Returns the inserted row id. */
export async function insertRelationalSignal(input: InsertInput): Promise<string | null> {
  const source = safeSource(input.source);
  if (!input.memberId || !source) return null;

  // Fail closed: withhold the relationship-state assertion unless this source can
  // positively prove member authorship. Today none can.
  const ruptureState = DECLARATION_CAPABLE_SOURCES.has(source)
    ? safeRupture(input.ruptureState)
    : null;

  try {
    const row = await insertOne<{ id: string }>('member_relational_signals', {
      member_id: input.memberId,
      relationship_id: input.relationshipId || null,
      counterpart_label: safeCounterpart(input.counterpartLabel),
      tone: safeTone(input.tone),
      rupture_state: ruptureState,
      dynamic_tags: safeDynamicTags(input.dynamicTags),
      frameworks_applied: safeFrameworks(input.frameworksApplied),
      source,
      confidence:
        typeof input.confidence === 'number' && input.confidence >= 0 && input.confidence <= 1
          ? input.confidence
          : null,
      source_turn_id: safeTurnId(input.sourceTurnId),
      movement_cue: safeMovementCue(input.movementCue),
    });
    return row?.id ?? null;
  } catch (err) {
    // Never surface DB errors to live conversation — this is fire-and-forget.
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('does not exist')) {
      console.warn(
        '[relationalSignals] table missing — migration 20260409000010_member_relational_signals.sql not applied',
      );
    } else {
      console.warn('[relationalSignals] insert failed:', msg);
    }
    return null;
  }
}

/**
 * Convenience: take a DetectedSignal + memberId and persist as
 * `maia_conversation`. Returns null when below threshold.
 *
 * @param sourceTurnId Optional maia_turns.id for founder review-time join.
 */
export async function persistDetectedSignal(
  memberId: string,
  detected: DetectedSignal,
  relationshipId?: string | null,
  sourceTurnId?: number | null,
): Promise<string | null> {
  if (!detected.detected) return null;
  return insertRelationalSignal({
    memberId,
    relationshipId: relationshipId ?? null,
    counterpartLabel: detected.counterpartLabel,
    tone: detected.tone,
    ruptureState: detected.ruptureState,
    dynamicTags: detected.dynamicTags,
    frameworksApplied: detected.frameworksApplied,
    source: 'maia_conversation',
    confidence: detected.confidence,
    sourceTurnId: sourceTurnId ?? null,
    movementCue: detected.movementCue ?? null,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

interface SignalRow {
  id: string;
  member_id: string;
  relationship_id: string | null;
  counterpart_label: string | null;
  tone: string | null;
  rupture_state: string | null;
  dynamic_tags: string[] | null;
  frameworks_applied: string[] | null;
  source: string;
  confidence: number | null;
  source_turn_id: string | number | null;
  movement_cue: string | null;
  created_at: Date;
}

function rowToSignal(row: SignalRow): RelationshipSignal {
  // pg returns bigint as string to avoid precision loss. Normalize.
  const turnId =
    row.source_turn_id == null
      ? null
      : typeof row.source_turn_id === 'number'
        ? row.source_turn_id
        : Number(row.source_turn_id);

  // RUPTURE CONTAINMENT — READ SIDE. Founder ruling 2026-08-13:
  //   "No inferred state may render as first-person/member-authored language.
  //    Until the schema can actually represent member declaration, existing rows
  //    fail closed rather than appearing as 'Something is broken.'"
  //
  // Contained HERE — the single row→signal chokepoint that every reader passes
  // through — rather than in the card that renders it. Same reasoning as the
  // write gate: a boundary held at one UI component protects that component;
  // a boundary held at the serve edge protects every consumer that exists or is
  // built later, including the iOS shell, and means the unsupported assertion
  // never leaves the server at all.
  //
  // The 97 historical rows keep their stored value untouched; they simply stop
  // being handed to anything that could speak them in the member's voice.
  const ruptureState = DECLARATION_CAPABLE_SOURCES.has(String(row.source))
    ? safeRupture(row.rupture_state)
    : null;

  return {
    id: row.id,
    memberId: row.member_id,
    relationshipId: row.relationship_id,
    counterpartLabel: safeCounterpart(row.counterpart_label),
    tone: safeTone(row.tone),
    ruptureState,
    dynamicTags: safeDynamicTags(row.dynamic_tags ?? []),
    frameworksApplied: row.frameworks_applied ?? [],
    source: (row.source as SignalSource) ?? 'maia_conversation',
    confidence: row.confidence,
    sourceTurnId: Number.isFinite(turnId) ? turnId : null,
    movementCue: safeMovementCue(row.movement_cue),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

/** Most recent signal for this member, or null if none exist. */
export async function getLatestSignal(memberId: string): Promise<RelationshipSignal | null> {
  try {
    const row = await queryOne<SignalRow>(
      `SELECT id, member_id, relationship_id, counterpart_label, tone,
              rupture_state, dynamic_tags, frameworks_applied, source,
              confidence, source_turn_id, movement_cue, created_at
       FROM member_relational_signals
       WHERE member_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [memberId],
    );
    return row ? rowToSignal(row) : null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('does not exist')) {
      console.warn('[relationalSignals] read failed:', msg);
    }
    return null;
  }
}

/** Latest N signals for this member. */
export async function getRecentSignals(
  memberId: string,
  limit = 5,
): Promise<RelationshipSignal[]> {
  try {
    const safeLimit = Math.max(1, Math.min(limit, 25));
    const result = await query<SignalRow>(
      `SELECT id, member_id, relationship_id, counterpart_label, tone,
              rupture_state, dynamic_tags, frameworks_applied, source,
              confidence, source_turn_id, movement_cue, created_at
       FROM member_relational_signals
       WHERE member_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [memberId, safeLimit],
    );
    return result.rows.map(rowToSignal);
  } catch {
    return [];
  }
}

// [Relational Layer — Phase 4]
/**
 * Count prior signals that match a given tone + counterpart. Powers the
 * Relational Field continuity hint ("This has surfaced before.") at N ≥ 1.
 *
 * CRITICAL: excludes the "current" signal row when `excludeSignalId` is
 * provided. Without this, the count always includes the latest row and
 * the threshold becomes unreliable immediately after a labtool save.
 *
 * Intentionally narrow: we filter on tone and counterpart_label only.
 * Anything fancier belongs in the founder review surface, not the client.
 */
export async function countMatchingSignals(
  memberId: string,
  opts: {
    tone?: string | null;
    counterpart?: string | null;
    excludeSignalId?: string | null;
  },
): Promise<number> {
  if (!memberId) return 0;

  const where: string[] = ['member_id = $1'];
  const values: unknown[] = [memberId];

  if (opts.tone) {
    values.push(opts.tone);
    where.push(`tone = $${values.length}`);
  }
  if (opts.counterpart) {
    values.push(opts.counterpart);
    where.push(`counterpart_label = $${values.length}`);
  }
  if (opts.excludeSignalId) {
    values.push(opts.excludeSignalId);
    where.push(`id <> $${values.length}`);
  }

  try {
    const result = await query<{ n: string }>(
      `SELECT COUNT(*)::text AS n
         FROM member_relational_signals
        WHERE ${where.join(' AND ')}`,
      values,
    );
    const n = Number(result.rows[0]?.n ?? 0);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
