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
  RelationshipSignal,
  RelationshipTone,
  RuptureState,
  SignalSource,
} from './types';
import {
  CANONICAL_COUNTERPART_LABELS,
  CANONICAL_DYNAMIC_TAGS,
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
}

/** Persist one relational signal. Returns the inserted row id. */
export async function insertRelationalSignal(input: InsertInput): Promise<string | null> {
  const source = safeSource(input.source);
  if (!input.memberId || !source) return null;

  try {
    const row = await insertOne<{ id: string }>('member_relational_signals', {
      member_id: input.memberId,
      relationship_id: input.relationshipId || null,
      counterpart_label: safeCounterpart(input.counterpartLabel),
      tone: safeTone(input.tone),
      rupture_state: safeRupture(input.ruptureState),
      dynamic_tags: safeDynamicTags(input.dynamicTags),
      frameworks_applied: safeFrameworks(input.frameworksApplied),
      source,
      confidence:
        typeof input.confidence === 'number' && input.confidence >= 0 && input.confidence <= 1
          ? input.confidence
          : null,
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
 */
export async function persistDetectedSignal(
  memberId: string,
  detected: DetectedSignal,
  relationshipId?: string | null,
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
  created_at: Date;
}

function rowToSignal(row: SignalRow): RelationshipSignal {
  return {
    id: row.id,
    memberId: row.member_id,
    relationshipId: row.relationship_id,
    counterpartLabel: safeCounterpart(row.counterpart_label),
    tone: safeTone(row.tone),
    ruptureState: safeRupture(row.rupture_state),
    dynamicTags: safeDynamicTags(row.dynamic_tags ?? []),
    frameworksApplied: row.frameworks_applied ?? [],
    source: (row.source as SignalSource) ?? 'maia_conversation',
    confidence: row.confidence,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

/** Most recent signal for this member, or null if none exist. */
export async function getLatestSignal(memberId: string): Promise<RelationshipSignal | null> {
  try {
    const row = await queryOne<SignalRow>(
      `SELECT id, member_id, relationship_id, counterpart_label, tone,
              rupture_state, dynamic_tags, frameworks_applied, source,
              confidence, created_at
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
              confidence, created_at
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
